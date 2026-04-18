#!/usr/bin/env python3
"""CLI wrapper — logic lives in `app.openapi_compare`."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.openapi_compare import main  # noqa: E402

if __name__ == "__main__":
    main()
