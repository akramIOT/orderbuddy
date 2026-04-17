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

## Export OpenAPI for comparison with Nest

Useful for diffing against the Nest `/swagger` document:

```bash
python scripts/export_openapi.py > openapi-checkout.json
```

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
```

## CI

GitHub Actions workflow: `.github/workflows/checkout-api-ci.yml` (runs on changes under `orderbuddy/checkout-api/`).
