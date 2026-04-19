"""Shared menu/origin/location IDs and documents for in-memory and MongoDB benchmarks."""

from __future__ import annotations

from typing import Any

from bson import ObjectId

MENU_ID = ObjectId("674e2f2f2f2f2f2f2f2f2f2f")
ORIGIN_ID = ObjectId("674e2f2f2f2f2f2f2f2f2f2e")
LOCATION_ID = ObjectId("674e2f2f2f2f2f2f2f2f2f2d")


def benchmark_seed() -> dict[str, list[dict[str, Any]]]:
    """Same shape as tests' FakeAsyncDb seed; used by benchmark_checkout and Mongo seed."""
    return {
        "origins": [
            {"_id": ORIGIN_ID, "restaurantId": "cuppa_co", "locationId": LOCATION_ID},
        ],
        "menus": [
            {
                "_id": MENU_ID,
                "restaurantId": "cuppa_co",
                "locationId": LOCATION_ID,
                "available": True,
                "items": [
                    {
                        "id": "mi-1",
                        "priceCents": 500,
                        "isAvailable": True,
                        "modifiers": [
                            {
                                "id": "size",
                                "maxChoices": 1,
                                "freeChoices": 0,
                                "extraChoicePriceCents": 0,
                                "options": [
                                    {"id": "sm", "priceCents": 0},
                                    {"id": "lg", "priceCents": 100},
                                ],
                            }
                        ],
                    },
                ],
            }
        ],
        "locations": [
            {"_id": LOCATION_ID, "restaurantId": "cuppa_co", "payment": {"oid": "t", "auth": "x"}},
        ],
        "orders": [],
    }


def benchmark_checkout_payload() -> dict[str, Any]:
    return {
        "originId": str(ORIGIN_ID),
        "menuId": str(MENU_ID),
        "items": [{"menuItemId": "mi-1", "quantity": 2, "modifiers": {"size": [{"id": "lg"}]}}],
        "paymentMethod": "card",
        "customerInfo": {"name": "Bench User", "phone": "555-0100"},
    }
