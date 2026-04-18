#!/usr/bin/env python3
"""Emit FastAPI OpenAPI JSON (for diffing against Nest Swagger export)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Allow `python scripts/export_openapi.py` from checkout-api/
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Write JSON to this file instead of stdout",
    )
    args = parser.parse_args()
    data = app.openapi()
    text = json.dumps(data, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text + "\n", encoding="utf-8")
        print(f"Wrote {args.output}", file=sys.stderr)
    else:
        print(text)


if __name__ == "__main__":
    main()
