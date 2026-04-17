from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock

import pytest
from bson import ObjectId

from app.config import Settings


@pytest.fixture
def menu_id() -> ObjectId:
    return ObjectId("674e2f2f2f2f2f2f2f2f2f2f")


@pytest.fixture
def origin_id() -> ObjectId:
    return ObjectId("674e2f2f2f2f2f2f2f2f2f2e")


@pytest.fixture
def location_id() -> ObjectId:
    return ObjectId("674e2f2f2f2f2f2f2f2f2f2d")


@pytest.fixture
def mongo_seed(menu_id: ObjectId, origin_id: ObjectId, location_id: ObjectId) -> dict[str, list[dict[str, Any]]]:
    return {
        "origins": [
            {
                "_id": origin_id,
                "restaurantId": "cuppa_co",
                "locationId": location_id,
            }
        ],
        "menus": [
            {
                "_id": menu_id,
                "restaurantId": "cuppa_co",
                "locationId": location_id,
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
                    {
                        "id": "mi-off",
                        "priceCents": 300,
                        "isAvailable": False,
                    },
                ],
            }
        ],
        "locations": [
            {
                "_id": location_id,
                "restaurantId": "cuppa_co",
                "payment": {"oid": "test_oid", "auth": "test_bearer"},
            }
        ],
        "orders": [],
    }


class _FakeCollection:
    def __init__(self, name: str, seed: dict[str, list[dict[str, Any]]]) -> None:
        self._name = name
        self._seed = seed

    def _docs(self) -> list[dict[str, Any]]:
        return list(self._seed.get(self._name, []))

    async def find_one(
        self,
        query: dict[str, Any],
        projection: dict[str, Any] | None = None,
    ) -> dict[str, Any] | None:
        for doc in self._docs():
            if _doc_matches(doc, query):
                if projection:
                    return _project(doc, projection)
                return doc
        return None

    async def insert_one(self, doc: dict[str, Any]) -> Any:
        self._seed.setdefault("orders", []).append(doc)
        return MagicMock(inserted_id=doc.get("_id"))


def _project(doc: dict[str, Any], projection: dict[str, Any]) -> dict[str, Any]:
    if not projection:
        return doc
    out: dict[str, Any] = {}
    for k, v in projection.items():
        if v and k in doc:
            out[k] = doc[k]
    return out


def _doc_matches(doc: dict[str, Any], query: dict[str, Any]) -> bool:
    for key, expected in query.items():
        got = doc.get(key)
        if key == "_id" and isinstance(expected, ObjectId):
            ge = got if isinstance(got, ObjectId) else ObjectId(str(got)) if got else None
            if ge != expected:
                return False
        elif got != expected:
            return False
    return True


class FakeAsyncDb:
    def __init__(self, seed: dict[str, list[dict[str, Any]]]) -> None:
        self._seed = seed

    def __getitem__(self, name: str) -> _FakeCollection:
        return _FakeCollection(name, self._seed)


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        payment_gateway_mock=True,
        payment_provider="mock",
        mongodb_uri="mongodb://localhost:27017",
        mongodb_db="test",
    )


@pytest.fixture
def checkout_payload(menu_id: ObjectId, origin_id: ObjectId) -> dict[str, Any]:
    return {
        "originId": str(origin_id),
        "menuId": str(menu_id),
        "items": [{"menuItemId": "mi-1", "quantity": 2, "modifiers": {"size": [{"id": "lg"}]}}],
        "paymentMethod": "card",
        "customerInfo": {"name": "Test User", "phone": "555-0100"},
    }
