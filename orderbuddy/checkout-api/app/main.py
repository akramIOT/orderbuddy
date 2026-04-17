from contextlib import asynccontextmanager

import httpx
from fastapi import Depends, FastAPI
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.deps import get_checkout_service
from app.schemas.checkout import CheckoutFormDto, OrderConfirmationDto
from app.services.checkout_service import CheckoutService
from app.services.payment_gateway import CheckoutPaymentClient, PaymentCircuitBreaker


@asynccontextmanager
async def lifespan(app: FastAPI):
    mongo = AsyncIOMotorClient(settings.mongodb_uri)
    db = mongo[settings.mongodb_db]
    http = httpx.AsyncClient()
    breaker = PaymentCircuitBreaker(
        failure_threshold=settings.circuit_failure_threshold,
        open_seconds=settings.circuit_open_seconds,
    )
    payments = CheckoutPaymentClient(settings, http, breaker)
    app.state.checkout_service = CheckoutService(db, payments, settings)
    app.state.mongo_client = mongo
    app.state.http_client = http
    yield
    await http.aclose()
    mongo.close()


app = FastAPI(
    title="OrderBuddy Checkout API",
    description="FastAPI migration of POST /order-app/checkout",
    version="1.0.0",
    lifespan=lifespan,
)


@app.post("/order-app/checkout", response_model=OrderConfirmationDto)
async def checkout(
    body: CheckoutFormDto,
    svc: CheckoutService = Depends(get_checkout_service),
) -> OrderConfirmationDto:
    return await svc.checkout(body)
