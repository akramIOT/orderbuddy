"""Tests for OpenAPI checkout parity helpers."""

from __future__ import annotations

import json

from app.openapi_compare import (
    compare_checkout,
    find_checkout_post,
    normalize_schema,
    schema_diff,
)


def test_normalize_sorts_required_and_properties():
    a = {
        "type": "object",
        "required": ["b", "a"],
        "properties": {"b": {"type": "string"}, "a": {"type": "number"}},
    }
    n = normalize_schema(a)
    assert n["required"] == ["a", "b"]
    assert list(n["properties"].keys()) == ["a", "b"]


def test_schema_diff_detects_missing_key():
    a = {"type": "object", "properties": {"x": {"type": "string"}}}
    b = {"type": "object", "properties": {}}
    d = schema_diff(normalize_schema(a), normalize_schema(b))
    assert any("missing" in x for x in d)


def test_compare_checkout_allows_transaction_token_when_not_strict() -> None:
    nest = {
        "openapi": "3.0.0",
        "paths": {
            "/order-app/checkout": {
                "post": {
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": [
                                        "originId",
                                        "menuId",
                                        "items",
                                        "paymentMethod",
                                        "customerInfo",
                                    ],
                                    "properties": {
                                        "originId": {"type": "string"},
                                        "menuId": {"type": "string"},
                                        "items": {"type": "array"},
                                        "paymentMethod": {"type": "string", "enum": ["card", "wallet"]},
                                        "customerInfo": {"$ref": "#/components/schemas/CustomerInfoDto"},
                                    },
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/OrderConfirmationDto"}
                                }
                            }
                        }
                    },
                }
            }
        },
        "components": {
            "schemas": {
                "CustomerInfoDto": {
                    "type": "object",
                    "required": ["name"],
                    "properties": {"name": {"type": "string"}, "phone": {"type": "string"}},
                },
                "OrderConfirmationDto": {
                    "type": "object",
                    "required": ["orderId", "createdAt", "status"],
                    "properties": {
                        "orderId": {"type": "string"},
                        "createdAt": {"type": "string"},
                        "estimatedReadyAt": {"type": "string"},
                        "status": {"type": "string", "enum": ["pending", "accepted", "ready"]},
                    },
                },
            }
        },
    }
    fast = json.loads(json.dumps(nest))
    fast["paths"]["/order-app/checkout"]["post"]["requestBody"]["content"]["application/json"]["schema"][
        "properties"
    ]["transactionToken"] = {"type": "string", "nullable": True}

    err, info = compare_checkout(nest, fast, strict=False)
    assert not err, err
    assert any("transactionToken" in i for i in info)

    err_strict, _ = compare_checkout(nest, fast, strict=True)
    assert err_strict


def test_find_path_by_suffix():
    spec = {"paths": {"/api/v1/order-app/checkout": {"post": {"responses": {"200": {"description": "ok"}}}}}}
    p, op = find_checkout_post(spec)
    assert p == "/api/v1/order-app/checkout"
    assert op is not None
