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
app/openapi_compare.py
openapi/.gitignore
```

## CI

GitHub Actions workflow: `.github/workflows/checkout-api-ci.yml` (runs on changes under `orderbuddy/checkout-api/`).
