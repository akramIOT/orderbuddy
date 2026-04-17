from typing import Any, Literal

from pydantic import BaseModel, Field, ValidationInfo, field_validator, model_validator


class CartItemInput(BaseModel):
    """Matches NestJS `CartItemInput` (order-app.controller.dto)."""

    menuItemId: str = Field(..., min_length=1)
    quantity: int = Field(..., gt=0)
    modifiers: dict[str, Any] | None = None


class CustomerInfoDto(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str | None = None


class CheckoutFormDto(BaseModel):
    """POST /order-app/checkout body — contract aligned with NestJS `CheckoutFormDto`."""

    originId: str = Field(..., min_length=1)
    menuId: str = Field(..., min_length=1)
    items: list[CartItemInput]
    paymentMethod: Literal["card", "wallet"]
    customerInfo: CustomerInfoDto

    @field_validator("menuId", "originId")
    @classmethod
    def strip_ids(cls, v: str) -> str:
        return v.strip()

    @model_validator(mode="after")
    def items_non_empty(self) -> "CheckoutFormDto":
        if not self.items:
            raise ValueError("items must contain at least one line")
        return self

    @model_validator(mode="after")
    def validate_menu_item_availability(self, info: ValidationInfo) -> "CheckoutFormDto":
        """When `ValidationInfo.context` includes `items_by_id` and `menu_available`, enforce menu rules."""
        ctx = info.context
        if not ctx:
            return self
        if ctx.get("menu_available") is False:
            raise ValueError("menu is not available for ordering")
        items_by_id: dict[str, Any] | None = ctx.get("items_by_id")
        if not items_by_id:
            return self
        for line in self.items:
            row = items_by_id.get(line.menuItemId)
            if row is None:
                raise ValueError(f"unknown menu item: {line.menuItemId}")
            if not row.get("isAvailable", False):
                raise ValueError(f"menu item is not available: {line.menuItemId}")
        return self


class OrderConfirmationDto(BaseModel):
    """Response shape from NestJS `OrderConfirmationDto`."""

    orderId: str
    createdAt: str
    estimatedReadyAt: str | None = None
    status: Literal["pending", "accepted", "ready"]
