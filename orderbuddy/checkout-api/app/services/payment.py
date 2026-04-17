import asyncio
import time
from typing import Any

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
    """Lightweight circuit breaker for outbound payment calls (complements Tenacity retries)."""

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


class PaymentGatewayClient:
    """Async payment authorization with Tenacity retries + circuit breaker."""

    def __init__(self, settings: Settings, client: httpx.AsyncClient, breaker: PaymentCircuitBreaker) -> None:
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
    ) -> dict[str, Any]:
        if self._settings.payment_gateway_mock or not self._settings.payment_gateway_url:
            return {"status": "ok", "mock": True}

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
