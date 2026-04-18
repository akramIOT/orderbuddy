"""
Compare NestJS and FastAPI OpenAPI specs for POST */checkout parity.

Used by `scripts/compare_openapi.py` CLI and tests.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

CHECKOUT_SUFFIX = "/checkout"
PYTHON_ONLY_BODY_FIELDS = frozenset({"transactionToken"})


def load_spec(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def find_checkout_post(spec: dict[str, Any]) -> tuple[str | None, dict[str, Any] | None]:
    paths = spec.get("paths") or {}
    for path_key, item in paths.items():
        if not path_key.rstrip("/").endswith(CHECKOUT_SUFFIX):
            continue
        post = (item or {}).get("post")
        if post:
            return path_key, post
    return None, None


def follow_ref(spec: dict[str, Any], ref: str) -> dict[str, Any]:
    if not ref.startswith("#/"):
        raise ValueError(f"Unsupported ref: {ref}")
    parts = ref.strip("#/").split("/")
    node: Any = spec
    for p in parts:
        node = node[p]
    if not isinstance(node, dict):
        raise ValueError(f"Ref {ref} did not resolve to an object")
    return node


def resolve_schema_object(spec: dict[str, Any], schema: dict[str, Any] | None) -> dict[str, Any]:
    if not schema:
        return {}
    node = dict(schema)
    seen: set[str] = set()
    while "$ref" in node:
        ref = node["$ref"]
        if ref in seen:
            break
        seen.add(ref)
        node = follow_ref(spec, ref)
    if "allOf" in node:
        merged: dict[str, Any] = {"type": "object", "properties": {}}
        props = merged["properties"]
        req: list[str] = []
        for part in node["allOf"]:
            sub = resolve_schema_object(spec, part if isinstance(part, dict) else {})
            for k, v in (sub.get("properties") or {}).items():
                props[k] = v
            req.extend(sub.get("required") or [])
        if req:
            merged["required"] = list(dict.fromkeys(req))
        return merged
    return node


def get_json_schema(spec: dict[str, Any], op: dict[str, Any], *, response: bool) -> dict[str, Any]:
    if response:
        responses = op.get("responses") or {}
        ok = responses.get("200") or responses.get("201") or {}
        content = (ok.get("content") or {}).get("application/json") or {}
        schema = content.get("schema") or {}
        return resolve_schema_object(spec, schema if isinstance(schema, dict) else {})

    rb = op.get("requestBody") or {}
    content = (rb.get("content") or {}).get("application/json") or {}
    schema = content.get("schema") or {}
    return resolve_schema_object(spec, schema if isinstance(schema, dict) else {})


STRIP_KEYS = frozenset({"title", "description", "default", "examples", "example"})


def normalize_schema(obj: Any, *, strip: frozenset[str] = STRIP_KEYS) -> Any:
    if isinstance(obj, dict):
        out: dict[str, Any] = {}
        for k, v in obj.items():
            if k in strip:
                continue
            if k == "properties" and isinstance(v, dict):
                out[k] = {pk: normalize_schema(pv, strip=strip) for pk, pv in sorted(v.items())}
            elif k == "required" and isinstance(v, list):
                out[k] = sorted(v)
            else:
                out[k] = normalize_schema(v, strip=strip)
        return dict(sorted(out.items()))
    if isinstance(obj, list):
        return [normalize_schema(x, strip=strip) for x in obj]
    return obj


def schema_diff(
    a: Any,
    b: Any,
    path: str = "",
) -> list[str]:
    if type(a) != type(b) and not (a is None or b is None):
        return [f"{path}: type {type(a).__name__} != {type(b).__name__}"]
    if isinstance(a, dict) and isinstance(b, dict):
        diffs: list[str] = []
        keys = set(a) | set(b)
        for k in sorted(keys):
            p = f"{path}.{k}" if path else k
            if k not in a:
                diffs.append(f"{p}: missing in first spec (Nest)")
            elif k not in b:
                diffs.append(f"{p}: missing in second spec (FastAPI)")
            else:
                diffs.extend(schema_diff(a[k], b[k], p))
        return diffs
    if isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            return [f"{path}: list length {len(a)} != {len(b)}"]
        diffs = []
        for i, (x, y) in enumerate(zip(a, b, strict=True)):
            diffs.extend(schema_diff(x, y, f"{path}[{i}]"))
        return diffs
    if a != b:
        return [f"{path}: {a!r} != {b!r}"]
    return []


def compare_checkout(
    nest: dict[str, Any],
    fastapi: dict[str, Any],
    *,
    strict: bool,
) -> tuple[list[str], list[str]]:
    """Returns (errors, infos)."""
    infos: list[str] = []
    errors: list[str] = []

    np, nop = find_checkout_post(nest)
    fp, fop = find_checkout_post(fastapi)
    if not nop:
        errors.append("Nest spec: could not find POST */checkout (export while API is running; path may differ).")
    if not fop:
        errors.append("FastAPI spec: could not find POST */checkout.")

    if not nop or not fop:
        return errors, infos

    if np != fp:
        infos.append(f"Path key differs: Nest={np!r} vs FastAPI={fp!r} (comparing schemas anyway).")

    nest_req = normalize_schema(get_json_schema(nest, nop, response=False))
    fast_req = normalize_schema(get_json_schema(fastapi, fop, response=False))

    nest_props = (nest_req.get("properties") or {}) if isinstance(nest_req, dict) else {}
    fast_props = (fast_req.get("properties") or {}) if isinstance(fast_req, dict) else {}

    if not strict:
        for name in PYTHON_ONLY_BODY_FIELDS:
            if name in fast_props and name not in nest_props:
                infos.append(
                    f"FastAPI-only optional body field (allowed): {name!r} — omit in clients that target Nest only."
                )
                fast_req = dict(fast_req) if isinstance(fast_req, dict) else fast_req
                props = dict(fast_req.get("properties") or {})
                props.pop(name, None)
                fast_req["properties"] = props
                req = list(fast_req.get("required") or [])
                if name in req:
                    req.remove(name)
                    fast_req["required"] = req

    req_diffs = schema_diff(nest_req, fast_req)
    for d in req_diffs:
        errors.append(f"requestBody: {d}")

    nest_res = normalize_schema(get_json_schema(nest, nop, response=True))
    fast_res = normalize_schema(get_json_schema(fastapi, fop, response=True))
    res_diffs = schema_diff(nest_res, fast_res)
    for d in res_diffs:
        errors.append(f"response 200: {d}")

    return errors, infos


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("nest_openapi", type=Path, help="Path to Nest-exported OpenAPI JSON")
    ap.add_argument("fastapi_openapi", type=Path, help="Path to FastAPI openapi.json (from export_openapi.py)")
    ap.add_argument(
        "--strict",
        action="store_true",
        help="Disallow FastAPI-only fields such as transactionToken on the request body.",
    )
    args = ap.parse_args()

    nest = load_spec(args.nest_openapi)
    fast = load_spec(args.fastapi_openapi)

    errors, infos = compare_checkout(nest, fast, strict=args.strict)

    for line in infos:
        print(f"INFO: {line}", file=sys.stderr)
    if errors:
        print("OpenAPI parity check: FAILED", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        raise SystemExit(1)

    print("OpenAPI parity check: OK (request + response schemas match after normalization).")
    for line in infos:
        print(f"NOTE: {line}")


if __name__ == "__main__":
    main()
