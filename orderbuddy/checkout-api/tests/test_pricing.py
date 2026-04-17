import pytest

from app.services.pricing import line_total_cents, validate_and_sum_modifiers_cents


def test_modifier_unknown_option():
    item = {
        "id": "x",
        "modifiers": [
            {
                "id": "m1",
                "maxChoices": 2,
                "freeChoices": 1,
                "extraChoicePriceCents": 50,
                "options": [{"id": "a", "priceCents": 10}],
            }
        ],
    }
    with pytest.raises(ValueError, match="unknown option"):
        validate_and_sum_modifiers_cents({"m1": [{"id": "bad"}]}, item)


def test_line_total_with_modifier():
    item = {
        "id": "x",
        "priceCents": 500,
        "modifiers": [
            {
                "id": "m1",
                "maxChoices": 2,
                "freeChoices": 1,
                "extraChoicePriceCents": 50,
                "options": [{"id": "a", "priceCents": 100}, {"id": "b", "priceCents": 200}],
            }
        ],
    }
    # index 0 free within freeChoices; index 1 uses extraChoicePriceCents (50)
    cents = line_total_cents(500, 1, {"m1": [{"id": "a"}, {"id": "b"}]}, item)
    assert cents == 500 + 50


def test_unknown_modifier_id():
    item = {"id": "x", "priceCents": 100, "modifiers": []}
    with pytest.raises(ValueError, match="unknown modifier"):
        line_total_cents(100, 1, {"nope": []}, item)
