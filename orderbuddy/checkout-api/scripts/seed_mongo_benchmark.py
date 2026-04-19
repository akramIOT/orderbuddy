#!/usr/bin/env python3
"""
Upsert benchmark fixtures into MongoDB (origins, menus, locations).
Run after `docker compose up -d` (or any reachable MongoDB).

Usage (from checkout-api/):
  export MONGODB_URI=mongodb://127.0.0.1:27017
  export MONGODB_DB=orderbuddy_bench
  python scripts/seed_mongo_benchmark.py
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from pymongo import MongoClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.benchmark_fixtures import benchmark_seed  # noqa: E402
from app.db.collections import LOCATIONS, MENUS, ORIGINS  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--uri", default=os.environ.get("MONGODB_URI", "mongodb://127.0.0.1:27017"))
    ap.add_argument("--db", default=os.environ.get("MONGODB_DB", "orderbuddy_bench"))
    args = ap.parse_args()

    seed = benchmark_seed()
    client = MongoClient(args.uri, serverSelectionTimeoutMS=10_000)
    try:
        client.admin.command("ping")
    except Exception as e:
        print(f"Cannot reach MongoDB at {args.uri}: {e}", file=sys.stderr)
        sys.exit(1)

    db = client[args.db]
    for doc in seed["origins"]:
        db[ORIGINS].replace_one({"_id": doc["_id"]}, doc, upsert=True)
    for doc in seed["menus"]:
        db[MENUS].replace_one({"_id": doc["_id"]}, doc, upsert=True)
    for doc in seed["locations"]:
        db[LOCATIONS].replace_one({"_id": doc["_id"]}, doc, upsert=True)

    print(f"Seeded {args.db}: {ORIGINS}, {MENUS}, {LOCATIONS} (upsert by _id)", file=sys.stderr)
    client.close()


if __name__ == "__main__":
    main()
