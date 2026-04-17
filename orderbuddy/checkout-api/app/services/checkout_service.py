from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import ValidationError

from app.config import Settings
from app.db.collections import LOCATIONS, MENUS, ORDERS, ORIGINS
from app.schemas.checkout import CheckoutFormDto, OrderConfirmationDto
from app.services.payment_gateway import CheckoutPaymentClient, CircuitOpenError, EmergepayCredentials
from app.services.pricing import line_total_cents


def _oid(s: str, field: str) -> ObjectId:
    try:
        return ObjectId(s)
    except InvalidId as e:
        raise HTTPException(status_code=400, detail=f"invalid {field}") from e


def _location_id_str(doc: dict[str, Any]) -> str:
    lid = doc.get("locationId")
    if lid is None:
        return ""
    return str(lid) if isinstance(lid, ObjectId) else str(lid)


class CheckoutService:
    """Async checkout: validates menu/origin, availability, modifiers, payment, then persists order."""

    def __init__(self, db: AsyncIOMotorDatabase, payments: CheckoutPaymentClient, settings: Settings) -> None:
        self._db = db
        self._payments = payments
        self._settings = settings

    async def _resolve_emergepay_credentials(self, menu: dict[str, Any]) -> EmergepayCredentials | None:
        env = self._settings.emergepay_environment_url
        if not env:
            return None

        if not self._settings.emergepay_credentials_from_location:
            oid, tok = self._settings.emergepay_oid, self._settings.emergepay_auth_token
            if oid and tok:
                return EmergepayCredentials(environment_url=env, oid=oid, auth_token=tok)
            return None

        lid = menu.get("locationId")
        rid = menu.get("restaurantId")
        if lid is None or rid is None:
            return None

        q: dict[str, Any] = {"restaurantId": rid}
        q["_id"] = ObjectId(str(lid)) if not isinstance(lid, ObjectId) else lid

        loc = await self._db[LOCATIONS].find_one(q, projection={"payment": 1})
        if not loc:
            return None
        pay = loc.get("payment") or {}
        oid, tok = pay.get("oid"), pay.get("auth")
        if oid and tok:
            return EmergepayCredentials(environment_url=env, oid=str(oid), auth_token=str(tok))
        return None

    async def checkout(self, dto: CheckoutFormDto) -> OrderConfirmationDto:
        menu_oid = _oid(dto.menuId, "menuId")
        origin_oid = _oid(dto.originId, "originId")

        origins = self._db[ORIGINS]
        menus = self._db[MENUS]

        origin_task = origins.find_one({"_id": origin_oid})
        menu_task = menus.find_one({"_id": menu_oid})
        origin, menu = await asyncio.gather(origin_task, menu_task)

        if not origin:
            raise HTTPException(status_code=404, detail="origin not found")
        if not menu:
            raise HTTPException(status_code=404, detail="menu not found")

        if _location_id_str(origin) != _location_id_str(menu):
            raise HTTPException(status_code=400, detail="origin does not match menu location")

        items_by_id: dict[str, dict[str, Any]] = {}
        for it in menu.get("items") or []:
            iid = it.get("id")
            if isinstance(iid, str):
                items_by_id[iid] = it

        try:
            dto = CheckoutFormDto.model_validate(
                dto.model_dump(),
                context={
                    "items_by_id": items_by_id,
                    "menu_available": menu.get("available", True),
                },
            )
        except ValidationError as e:
            raise HTTPException(status_code=422, detail=jsonable_encoder(e.errors())) from e

        total_cents = 0
        for line in dto.items:
            row = items_by_id[line.menuItemId]
            try:
                total_cents += line_total_cents(
                    int(row.get("priceCents", 0)),
                    line.quantity,
                    line.modifiers,
                    row,
                )
            except ValueError as e:
                raise HTTPException(status_code=422, detail=str(e)) from e

        order_id = ObjectId()
        created_at = datetime.now(timezone.utc).isoformat()
        order_ref = str(order_id)

        emergepay_creds: EmergepayCredentials | None = None
        if (
            not self._settings.payment_gateway_mock
            and self._settings.payment_provider == "emergepay"
        ):
            emergepay_creds = await self._resolve_emergepay_credentials(menu)
            if emergepay_creds is None:
                raise HTTPException(
                    status_code=500,
                    detail="Emergepay is configured but credentials could not be resolved (config or location.payment)",
                )

        try:
            pay = await self._payments.authorize_checkout(
                payment_method=dto.paymentMethod,
                amount_cents=total_cents,
                order_ref=order_ref,
                payload_extra={"originId": dto.originId, "menuId": dto.menuId},
                emergepay=emergepay_creds,
                transaction_token=dto.transactionToken,
            )
        except CircuitOpenError as e:
            raise HTTPException(status_code=503, detail="payment gateway unavailable") from e
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e)) from e

        if isinstance(pay, dict) and pay.get("status") == "declined":
            raise HTTPException(status_code=402, detail="payment declined")

        doc = {
            "_id": order_id,
            "originId": dto.originId,
            "menuId": dto.menuId,
            "items": [line.model_dump() for line in dto.items],
            "paymentMethod": dto.paymentMethod,
            "customerInfo": dto.customerInfo.model_dump(),
            "createdAt": created_at,
            "status": "pending",
            "totalPriceCents": total_cents,
        }
        await self._db[ORDERS].insert_one(doc)

        return OrderConfirmationDto(
            orderId=str(order_id),
            createdAt=created_at,
            status="pending",
        )
