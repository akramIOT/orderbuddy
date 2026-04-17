"""Payment abstraction: mock, generic HTTP, or Emergepay checkout (ChargeIt Pro virtual terminal)."""

from __future__ import annotations

import asyncio
import time
import uuid
from dataclasses import dataclass
from typing import Any, Literal

import httpx
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential_jitter

from app.config import Settings


def _retryable_http_error(exc: Exception) -> bool:
    if isinstance(exc, (httpx.TimeoutException, httpx.TransportError)):
        return True
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code >= 500
    return False


class CircuitOpenError(Exception):
    pass


class PaymentCircuitBreaker:
    def __init__(self, failure_threshold: int, open_seconds: float) -> None:
        self._failure_threshold = failure_threshold
        self._open_seconds = open_seconds
        self._failures = 0
        self._opened_at: float | None = None
        self._lock = asyncio.Lock()

    async def before_call(self) -> None:
        async with self._lock:
            if self._opened_at is None:
                return
            if time.monotonic() - self._opened_at >= self._open_seconds:
                self._opened_at = None
                self._failures = 0
                return
            raise CircuitOpenError("payment gateway circuit is open")

    async def record_success(self) -> None:
        async with self._lock:
            self._failures = 0
            self._opened_at = None

    async def record_failure(self) -> None:
        async with self._lock:
            self._failures += 1
            if self._failures >= self._failure_threshold:
                self._opened_at = time.monotonic()


@dataclass(frozen=True)
class EmergepayCredentials:
    environment_url: str
    oid: str
    auth_token: str


class CheckoutPaymentClient:
    """
    Routes to mock, generic HTTP, or Emergepay `/orgs/{oid}/transactions/checkout`.
    """

    def __init__(
        self,
        settings: Settings,
        client: httpx.AsyncClient,
        breaker: PaymentCircuitBreaker,
    ) -> None:
        self._settings = settings
        self._client = client
        self._breaker = breaker

    async def authorize_checkout(
        self,
        *,
        payment_method: str,
        amount_cents: int,
        order_ref: str,
        payload_extra: dict[str, Any] | None = None,
        emergepay: EmergepayCredentials | None = None,
        transaction_token: str | None = None,
    ) -> dict[str, Any]:
        if self._settings.payment_gateway_mock:
            return {"status": "ok", "mock": True}

        provider: Literal["mock", "http", "emergepay"] = self._settings.payment_provider

        if provider == "mock" or (provider == "http" and not self._settings.payment_gateway_url):
            return {"status": "ok", "mock": True}

        if provider == "emergepay":
            return await self._authorize_emergepay(
                amount_cents=amount_cents,
                order_ref=order_ref,
                creds=emergepay,
                transaction_token=transaction_token,
            )

        return await self._authorize_http(
            payment_method=payment_method,
            amount_cents=amount_cents,
            order_ref=order_ref,
            payload_extra=payload_extra,
        )

    async def _authorize_http(
        self,
        *,
        payment_method: str,
        amount_cents: int,
        order_ref: str,
        payload_extra: dict[str, Any] | None,
    ) -> dict[str, Any]:
        await self._breaker.before_call()
        body: dict[str, Any] = {
            "paymentMethod": payment_method,
            "amountCents": amount_cents,
            "externalId": order_ref,
        }
        if payload_extra:
            body.update(payload_extra)
        try:
            result = await self._post_with_retry(body)
        except Exception:
            await self._breaker.record_failure()
            raise
        await self._breaker.record_success()
        return result

    @retry(
        reraise=True,
        stop=stop_after_attempt(4),
        wait=wait_exponential_jitter(initial=0.2, max=3),
        retry=retry_if_exception(_retryable_http_error),
    )
    async def _post_with_retry(self, body: dict[str, Any]) -> dict[str, Any]:
        assert self._settings.payment_gateway_url
        r = await self._client.post(
            self._settings.payment_gateway_url,
            json=body,
            timeout=self._settings.payment_timeout_seconds,
        )
        if r.status_code >= 500:
            r.raise_for_status()
        if r.status_code >= 400:
            return {"status": "declined", "httpStatus": r.status_code, "body": r.text}
        return r.json() if r.content else {"status": "ok"}

    async def _authorize_emergepay(
        self,
        *,
        amount_cents: int,
        order_ref: str,
        creds: EmergepayCredentials | None,
        transaction_token: str | None,
    ) -> dict[str, Any]:
        if creds is None:
            raise ValueError("Emergepay credentials not resolved")
        if not transaction_token or not transaction_token.strip():
            raise ValueError("transactionToken is required for Emergepay checkout")

        await self._breaker.before_call()
        amount_str = f"{(amount_cents / 100):.2f}"
        url = f"{creds.environment_url.rstrip('/')}/orgs/{creds.oid}/transactions/checkout"
        ext_id = uuid.uuid4().hex
        body = {
            "transactionToken": transaction_token.strip(),
            "transactionType": "CreditSale",
            "amount": amount_str,
            "externalTransactionId": ext_id,
        }
        headers = {
            "Authorization": f"Bearer {creds.auth_token}",
            "Content-Type": "application/json",
        }
        try:
            r = await self._post_emergepay_checkout(url, body, headers)
        except Exception:
            await self._breaker.record_failure()
            raise

        data = r.json() if r.content else {}
        inner = data.get("data", data)
        ok = str(inner.get("resultStatus", "")).lower() == "true"
        await self._breaker.record_success()
        if not ok:
            return {
                "status": "declined",
                "resultMessage": inner.get("resultMessage"),
                "raw": data,
            }
        return {"status": "ok", "emergepay": inner, "externalTransactionId": ext_id}

    @retry(
        reraise=True,
        stop=stop_after_attempt(4),
        wait=wait_exponential_jitter(initial=0.2, max=3),
        retry=retry_if_exception(_retryable_http_error),
    )
    async def _post_emergepay_checkout(self, url: str, body: dict[str, Any], headers: dict[str, str]) -> httpx.Response:
        r = await self._client.post(url, json=body, headers=headers, timeout=self._settings.payment_timeout_seconds)
        if r.status_code >= 500:
            r.raise_for_status()
        return r
