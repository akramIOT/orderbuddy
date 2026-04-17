from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import ValidationError

from app.db.collections import MENUS, ORDERS, ORIGINS
from app.schemas.checkout import CheckoutFormDto, OrderConfirmationDto
from app.services.payment import CircuitOpenError, PaymentGatewayClient


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
    """Async checkout: validates menu/origin, availability, payment, then persists order."""

    def __init__(self, db: AsyncIOMotorDatabase, payments: PaymentGatewayClient) -> None:
        self._db = db
        self._payments = payments

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
            raise HTTPException(status_code=422, detail=e.errors()) from e

        total_cents = 0
        for line in dto.items:
            row = items_by_id[line.menuItemId]
            total_cents += int(row.get("priceCents", 0)) * line.quantity

        order_id = ObjectId()
        created_at = datetime.now(timezone.utc).isoformat()
        order_ref = str(order_id)

        try:
            pay = await self._payments.authorize_checkout(
                payment_method=dto.paymentMethod,
                amount_cents=total_cents,
                order_ref=order_ref,
                payload_extra={"originId": dto.originId, "menuId": dto.menuId},
            )
        except CircuitOpenError as e:
            raise HTTPException(status_code=503, detail="payment gateway unavailable") from e

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
