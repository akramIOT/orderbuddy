#!/usr/bin/env python3
"""
Measure POST /order-app/checkout latency using FastAPI TestClient (in-process ASGI).

Uses the same in-memory fake MongoDB as tests — no real MongoDB or network I/O.
Payment is mocked (PAYMENT_GATEWAY_MOCK). Results isolate Python + Pydantic + service logic.

Usage (from checkout-api/):
  python scripts/benchmark_checkout.py
  python scripts/benchmark_checkout.py --iterations 2000 --warmup 100 --json-out openapi/performance_results.json
"""

from __future__ import annotations

import argparse
import json
import statistics
import sys
import time
from pathlib import Path
from typing import Any

import httpx
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.benchmark_fixtures import benchmark_checkout_payload, benchmark_seed  # noqa: E402
from app.config import Settings  # noqa: E402
from app.deps import get_checkout_service  # noqa: E402
from app.main import app  # noqa: E402
from app.services.checkout_service import CheckoutService  # noqa: E402
from app.services.payment_gateway import CheckoutPaymentClient, PaymentCircuitBreaker  # noqa: E402
from tests.conftest import FakeAsyncDb  # noqa: E402


def percentile(sorted_vals: list[float], p: float) -> float:
    if not sorted_vals:
        return 0.0
    k = (len(sorted_vals) - 1) * p / 100.0
    f = int(k)
    c = min(f + 1, len(sorted_vals) - 1)
    return sorted_vals[f] + (k - f) * (sorted_vals[c] - sorted_vals[f])


def run_benchmark(iterations: int, warmup: int) -> dict[str, Any]:
    seed = benchmark_seed()
    body = benchmark_checkout_payload()

    settings = Settings(
        payment_gateway_mock=True,
        payment_provider="mock",
        mongodb_uri="mongodb://localhost:27017",
        mongodb_db="bench",
    )
    db = FakeAsyncDb(seed)
    http = httpx.AsyncClient()
    pay = CheckoutPaymentClient(settings, http, PaymentCircuitBreaker(5, 30.0))
    svc = CheckoutService(db, pay, settings)  # type: ignore[arg-type]

    app.dependency_overrides[get_checkout_service] = lambda: svc

    lat_ms: list[float] = []
    try:
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
    finally:
        app.dependency_overrides.clear()

    lat_ms.sort()
    n = len(lat_ms)
    mean = statistics.mean(lat_ms)
    return {
        "environment": "FastAPI TestClient, in-memory fake MongoDB, mock payment",
        "iterations": iterations,
        "warmup": warmup,
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
    ap.add_argument("--json-out", type=Path, default=None)
    args = ap.parse_args()

    results = run_benchmark(args.iterations, args.warmup)
    text = json.dumps(results, indent=2)
    print(text)
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(text + "\n", encoding="utf-8")
        print(f"Wrote {args.json_out}", file=sys.stderr)


if __name__ == "__main__":
    main()
