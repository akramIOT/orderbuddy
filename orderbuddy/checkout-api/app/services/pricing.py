"""Cart line pricing aligned with NestJS `OrderAppService.calculateModifierPrice`."""

from __future__ import annotations

from typing import Any


def _coerce_selected_options(raw: Any) -> list[dict[str, Any]]:
    if raw is None:
        return []
    if not isinstance(raw, list):
        return []
    out: list[dict[str, Any]] = []
    for x in raw:
        if isinstance(x, str):
            out.append({"id": x})
        elif isinstance(x, dict) and "id" in x:
            out.append(x)
    return out


def calculate_modifier_price_cents(modifier: dict[str, Any], selected_raw: Any, options: list[dict[str, Any]]) -> int:
    free_choices = int(modifier.get("freeChoices", 0))
    max_choices = int(modifier.get("maxChoices", 0))
    selected_options = _coerce_selected_options(selected_raw)
    enforced = selected_options[:max_choices] if max_choices else selected_options

    option_by_id = {o.get("id"): o for o in options if o.get("id")}

    total = 0
    for index, option_item in enumerate(enforced):
        option_id = option_item.get("id")
        option = option_by_id.get(option_id)
        if option is None:
            raise ValueError(f"unknown option {option_id!r} for modifier {modifier.get('id')!r}")

        price = int(option.get("priceCents", 0))

        if index < free_choices:
            if free_choices == 0:
                total += price
        else:
            extra = int(modifier.get("extraChoicePriceCents", 0))
            if extra > 0:
                total += extra
            else:
                total += price

    return total


def validate_and_sum_modifiers_cents(
    modifiers: dict[str, Any] | None,
    menu_item: dict[str, Any],
) -> int:
    """Validate modifier IDs belong to the menu item and sum modifier surcharges in cents."""
    if not modifiers:
        return 0

    defs = {m["id"]: m for m in (menu_item.get("modifiers") or []) if isinstance(m, dict) and m.get("id")}

    extra = 0
    for mod_id, raw_selection in modifiers.items():
        mod = defs.get(mod_id)
        if mod is None:
            raise ValueError(f"unknown modifier {mod_id!r} for item {menu_item.get('id')!r}")

        options = mod.get("options") or []
        if not isinstance(options, list):
            options = []

        extra += calculate_modifier_price_cents(mod, raw_selection, options)

    return extra


def line_total_cents(price_cents: int, quantity: int, modifiers: dict[str, Any] | None, menu_item: dict[str, Any]) -> int:
    mod_cents = validate_and_sum_modifiers_cents(modifiers, menu_item)
    return (int(price_cents) + mod_cents) * int(quantity)
