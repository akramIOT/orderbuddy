from __future__ import annotations

from typing import Any

import httpx
import pytest
from bson import ObjectId
from httpx import ASGITransport

from app.config import Settings
from app.deps import get_checkout_service
from app.main import app
from app.services.checkout_service import CheckoutService
from app.services.payment_gateway import CheckoutPaymentClient, PaymentCircuitBreaker
from tests.conftest import FakeAsyncDb


@pytest.mark.asyncio
async def test_checkout_success(
    mongo_seed: dict,
    checkout_payload: dict[str, Any],
    menu_id: ObjectId,
    origin_id: ObjectId,
    test_settings: Settings,
) -> None:
    db = FakeAsyncDb(mongo_seed)
    http = httpx.AsyncClient()
    br = PaymentCircuitBreaker(5, 30.0)
    pay = CheckoutPaymentClient(test_settings, http, br)
    svc = CheckoutService(db, pay, test_settings)  # type: ignore[arg-type]

    app.dependency_overrides[get_checkout_service] = lambda: svc
    try:
        transport = ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            r = await client.post("/order-app/checkout", json=checkout_payload)
    finally:
        app.dependency_overrides.clear()
        await http.aclose()

    assert r.status_code == 200, r.text
    body = r.json()
    assert body["status"] == "pending"
    assert "orderId" in body
    assert mongo_seed["orders"], "order persisted"


@pytest.mark.asyncio
async def test_item_unavailable(
    mongo_seed: dict,
    menu_id: ObjectId,
    origin_id: ObjectId,
    test_settings: Settings,
) -> None:
    payload = {
        "originId": str(origin_id),
        "menuId": str(menu_id),
        "items": [{"menuItemId": "mi-off", "quantity": 1}],
        "paymentMethod": "card",
        "customerInfo": {"name": "x"},
    }
    db = FakeAsyncDb(mongo_seed)
    http = httpx.AsyncClient()
    pay = CheckoutPaymentClient(test_settings, http, PaymentCircuitBreaker(5, 30.0))
    svc = CheckoutService(db, pay, test_settings)  # type: ignore[arg-type]
    app.dependency_overrides[get_checkout_service] = lambda: svc
    try:
        transport = ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            r = await client.post("/order-app/checkout", json=payload)
    finally:
        app.dependency_overrides.clear()
        await http.aclose()

    assert r.status_code == 422


@pytest.mark.asyncio
async def test_openapi_includes_transaction_token_extension() -> None:
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/openapi.json")
    assert r.status_code == 200
    schema = r.json()
    checkout = schema["components"]["schemas"]["CheckoutFormDto"]
    assert "transactionToken" in checkout["properties"]
