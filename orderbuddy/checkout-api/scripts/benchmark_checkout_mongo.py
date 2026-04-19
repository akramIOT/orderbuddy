#!/usr/bin/env python3
"""
Measure POST /order-app/checkout against a real MongoDB (Motor) — same app path as production.

Set MONGODB_URI / MONGODB_DB in the environment *before* imports (this script does that first).
Uses FastAPI TestClient (in-process ASGI); latency includes Motor I/O + order inserts.

Prerequisite: MongoDB running and seeded (see docker-compose.yml + scripts/seed_mongo_benchmark.py).

Usage (from checkout-api/):
  docker compose up -d
  export MONGODB_URI=mongodb://127.0.0.1:27017 MONGODB_DB=orderbuddy_bench
  python scripts/seed_mongo_benchmark.py
  python scripts/benchmark_checkout_mongo.py --iterations 1500 --warmup 100 \\
    --json-out openapi/performance_results_mongo.json
"""

from __future__ import annotations

import argparse
import json
import os
import statistics
import sys
import time
from pathlib import Path
from typing import Any

# Configure env before importing the FastAPI app (Settings loads at import time).
def _configure_env(uri: str, db_name: str) -> None:
    os.environ["MONGODB_URI"] = uri
    os.environ["MONGODB_DB"] = db_name
    os.environ.setdefault("PAYMENT_GATEWAY_MOCK", "true")
    os.environ.setdefault("PAYMENT_PROVIDER", "mock")


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def percentile(sorted_vals: list[float], p: float) -> float:
    if not sorted_vals:
        return 0.0
    k = (len(sorted_vals) - 1) * p / 100.0
    f = int(k)
    c = min(f + 1, len(sorted_vals) - 1)
    return sorted_vals[f] + (k - f) * (sorted_vals[c] - sorted_vals[f])


def run_benchmark(iterations: int, warmup: int, uri: str, db_name: str, clean_orders_first: bool) -> dict[str, Any]:
    _configure_env(uri, db_name)

    from app.benchmark_fixtures import benchmark_checkout_payload  # noqa: E402
    from app.db.collections import ORDERS  # noqa: E402
    from app.main import app  # noqa: E402
    from fastapi.testclient import TestClient  # noqa: E402
    from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

    body = benchmark_checkout_payload()

    async def _maybe_clean_orders() -> None:
        if not clean_orders_first:
            return
        client = AsyncIOMotorClient(uri)
        try:
            await client[db_name][ORDERS].delete_many({})
        finally:
            client.close()

    import asyncio

    asyncio.run(_maybe_clean_orders())

    lat_ms: list[float] = []
    with TestClient(app, raise_server_exceptions=True) as client:
        for _ in range(warmup):
            r = client.post("/order-app/checkout", json=body)
            assert r.status_code == 200, r.text

        for _ in range(iterations):
            t0 = time.perf_counter()
            r = client.post("/order-app/checkout", json=body)
            dt = (time.perf_counter() - t0) * 1000.0
            assert r.status_code == 200, r.text
            lat_ms.append(dt)

    lat_ms.sort()
    n = len(lat_ms)
    mean = statistics.mean(lat_ms)
    return {
        "environment": (
            "FastAPI TestClient + Motor, real MongoDB, mock payment; "
            f"uri={uri!r} db={db_name!r}"
        ),
        "iterations": iterations,
        "warmup": warmup,
        "clean_orders_before_timed_run": clean_orders_first,
        "unit": "ms",
        "latency_ms": {
            "min": lat_ms[0],
            "max": lat_ms[-1],
            "mean": mean,
            "stdev": statistics.stdev(lat_ms) if n > 1 else 0.0,
            "p50": percentile(lat_ms, 50),
            "p95": percentile(lat_ms, 95),
            "p99": percentile(lat_ms, 99),
        },
        "throughput_rps": 1000.0 / mean if mean > 0 else 0.0,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--iterations", type=int, default=1500)
    ap.add_argument("--warmup", type=int, default=100)
    ap.add_argument("--uri", default=os.environ.get("MONGODB_URI", "mongodb://127.0.0.1:27017"))
    ap.add_argument("--db", default=os.environ.get("MONGODB_DB", "orderbuddy_bench"))
    ap.add_argument(
        "--clean-orders",
        action="store_true",
        help="Delete all documents in the orders collection before the timed run (warmup still inserts).",
    )
    ap.add_argument("--json-out", type=Path, default=None)
    args = ap.parse_args()

    results = run_benchmark(
        args.iterations,
        args.warmup,
        args.uri,
        args.db,
        clean_orders_first=args.clean_orders,
    )
    text = json.dumps(results, indent=2)
    print(text)
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(text + "\n", encoding="utf-8")
        print(f"Wrote {args.json_out}", file=sys.stderr)


if __name__ == "__main__":
    main()
