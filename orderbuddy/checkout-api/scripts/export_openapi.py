#!/usr/bin/env python3
"""Emit OpenAPI JSON to stdout (for diffing against Nest `swagger` export)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Allow `python scripts/export_openapi.py` from checkout-api/
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402


def main() -> None:
    print(json.dumps(app.openapi(), indent=2))


if __name__ == "__main__":
    main()
