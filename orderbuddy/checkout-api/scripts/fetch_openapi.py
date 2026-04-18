#!/usr/bin/env python3
"""Download OpenAPI JSON from a running HTTP server (e.g. Nest /swagger-json)."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("url", help="Full URL to OpenAPI JSON (e.g. http://localhost:8002/swagger-json)")
    p.add_argument("-o", "--output", type=Path, required=True, help="Output file path")
    args = p.parse_args()

    try:
        req = urllib.request.Request(args.url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read()
    except urllib.error.URLError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise SystemExit(2) from e

    try:
        data = json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as e:
        print(f"ERROR: response is not JSON: {e}", file=sys.stderr)
        raise SystemExit(3) from e

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Wrote {args.output} ({len(raw)} bytes)")


if __name__ == "__main__":
    main()
