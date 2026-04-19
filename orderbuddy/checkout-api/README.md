# OrderBuddy Checkout API (FastAPI)

Python migration of `POST /order-app/checkout` from the NestJS OrderBuddy API. Uses async I/O (Motor, httpx), Pydantic v2, and optional Emergepay-compatible payment calls with retries and a circuit breaker.

## Requirements

- Python 3.12+ (3.12 is used in CI)
- MongoDB reachable with the same collections the Nest app uses (`origins`, `menus`, `locations`, `orders`) when exercising full flows

## Setup

```bash
cd orderbuddy/checkout-api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

For tests and OpenAPI export:

```bash
pip install -r requirements-dev.txt
```

Copy environment template (optional):

```bash
cp .env.example .env
```

Edit `.env` to point at your MongoDB and payment settings. **Do not commit `.env`.**

## Configuration

Settings are loaded from the environment (see `app/config.py`). Common variables:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Mongo connection string |
| `MONGODB_DB` | Database name |
| `PAYMENT_GATEWAY_MOCK` | `true` (default): skip real payment HTTP; use for local dev and latency benchmarks without a PSP |
| `PAYMENT_PROVIDER` | `mock` \| `http` \| `emergepay` |
| `PAYMENT_GATEWAY_URL` | Generic HTTP payment endpoint when `PAYMENT_PROVIDER=http` |
| `EMERGEPAY_*` | Sandbox URL and credentials when using `emergepay` (see `.env.example`) |

Request body may include optional `transactionToken` when using Emergepay hosted checkout (see OpenAPI).

## Run the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8081
```

- Interactive docs: [http://localhost:8081/docs](http://localhost:8081/docs)
- OpenAPI JSON: [http://localhost:8081/openapi.json](http://localhost:8081/openapi.json)

## Tests

```bash
pytest -q
```

`pytest.ini` sets `pythonpath` so imports resolve from this directory.

## In-process performance benchmark (Python)

Measures **POST /order-app/checkout** via `TestClient` with an **in-memory fake DB** and **mock payment** (no real MongoDB or network). Useful for regression checks on the Python path; for Nest vs Python comparison, use the same load tool against both servers with identical payloads.

```bash
python scripts/benchmark_checkout.py --iterations 1500 --warmup 100 --json-out openapi/performance_results.json
```

Summary metrics are written to **`performance_benchmark.docx`** at the repo root (regenerate the Word file after updating the JSON if you change the script). Raw numbers: **`openapi/performance_results.json`**.

### MongoDB in Docker (on-prem) + Motor benchmark

For latency that includes **real MongoDB I/O** (reads + `orders` inserts) while keeping **payment mocked**, run the bundled **MongoDB 7** container, seed the same fixture IDs as the in-memory benchmark, then run the Mongo-backed script.

```bash
docker compose up -d
# wait until healthy (docker compose ps)
export MONGODB_URI=mongodb://127.0.0.1:27017
export MONGODB_DB=orderbuddy_bench
python scripts/seed_mongo_benchmark.py
python scripts/benchmark_checkout_mongo.py --iterations 1500 --warmup 100 \
  --json-out openapi/performance_results_mongo.json
```

- **`docker-compose.yml`** publishes **27017** and persists data in a named volume (`mongo_bench_data`).
- Use database **`orderbuddy_bench`** (or another name) so bench data stays separate from a local **`orderbuddy`** dev database.
- **`--clean-orders`** clears the `orders` collection before the timed loop (after env is set); use only against a disposable bench DB.

This still uses **TestClient** (in-process ASGI), so it is not identical to **uvicorn + HTTP** load tests, but Motor and BSON round-trips are real. For external load generation (e.g. `hey` / k6), run **`uvicorn`** against the same MongoDB URI and hit **`http://127.0.0.1:8081/order-app/checkout`**.

## OpenAPI / Swagger parity (Nest vs FastAPI)

Formal comparison checks that **`POST */checkout`** request and **200** response JSON Schemas align between the Nest export and this app (after normalizing titles/descriptions).

### 1. Export FastAPI spec

```bash
python scripts/export_openapi.py -o openapi/fastapi-openapi.json
```

### 2. Export Nest spec (API must be running)

With the Nest API up (default port from `orderbuddy/src/api` env, often `8002`), OpenAPI JSON is usually at **`/swagger-json`**:

```bash
python scripts/fetch_openapi.py "http://localhost:8002/swagger-json" -o openapi/nest-openapi.json
```

If your install uses another path, use the URL shown in Nest’s Swagger UI (browser devtools → Network) or the [`SwaggerModule` docs](https://docs.nestjs.com/openapi/introduction).

> If `checkout` is missing from the Nest export, add `@ApiBody`, `@ApiOkResponse`, and `@ApiProperty` on the DTOs/controller so Swagger includes the operation.

### 3. Compare

```bash
python scripts/compare_openapi.py openapi/nest-openapi.json openapi/fastapi-openapi.json
```

- Exit code **0** = structural match for checkout request/response schemas.
- **`--strict`**: fail if FastAPI-only fields (e.g. optional `transactionToken`) are present.

Generated JSON under `openapi/` is gitignored by default; keep local snapshots or commit a baseline if your team prefers.

## Project layout

```
app/
  main.py              # FastAPI app + lifespan (Mongo + httpx)
  config.py            # Pydantic settings
  schemas/checkout.py  # Request/response models
  services/
    checkout_service.py
    payment_gateway.py # mock / HTTP / Emergepay + Tenacity + circuit breaker
    pricing.py         # Menu line + modifier pricing
tests/
scripts/export_openapi.py
scripts/fetch_openapi.py
scripts/compare_openapi.py
scripts/benchmark_checkout.py
scripts/benchmark_checkout_mongo.py
scripts/seed_mongo_benchmark.py
docker-compose.yml
app/benchmark_fixtures.py
app/openapi_compare.py
openapi/.gitignore
openapi/performance_results.json
openapi/performance_results_mongo.json
```

## CI

GitHub Actions workflow: `.github/workflows/checkout-api-ci.yml` (runs on changes under `orderbuddy/checkout-api/`).
