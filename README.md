# ORDER_BUDDY

Monorepo-style workspace for **OrderBuddy** (Nest/TypeScript apps under `orderbuddy/`) and the **FastAPI checkout** migration used for the technical assessment.

## FastAPI checkout service

The Python checkout API lives in **`orderbuddy/checkout-api/`**. See that folder’s **README** for setup, environment variables, `uvicorn`, tests, and OpenAPI export.

```bash
cd orderbuddy/checkout-api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8081
```

## Documents

- **`migration.docx`** — migration strategy (architecture / assessment Part 2)
- **`reasoning.docx`** — performance reasoning vs original Nest checkout; Python file roles

## Security

Use **`.env`** locally for secrets; keep **`.env.example`** files free of real credentials. Never commit API keys or connection strings with passwords.
