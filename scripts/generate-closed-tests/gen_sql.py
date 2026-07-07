"""
Bakes a fixed bank of closed test cases into every sql-cat-* challenge's
tests.json, replacing the old live-oracle (referenceSolution/seedGenerator)
fields with pre-computed (seed SQL, expected rows) pairs.

For challenges with a generator.py: reseeds it with a fixed integer per case to
get a fresh, deterministic seed SQL string, runs solution.sql against it once
here, offline, and freezes the resulting rows as `expected`. Neither
generator.py nor solution.sql end up embedded in the shipped tests.json.

For the one legacy challenge without a generator.py (sql-cat-fishing-rank):
bakes its single static seed as case 1, recomputing `expected` fresh from
solution.sql rather than trusting the old hand-written fixture.

Usage: python scripts/generate-closed-tests/gen_sql.py
"""

import json
import random
import sqlite3
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CHALLENGES_DIR = REPO_ROOT / "challenges"
NUM_CASES = 18


def is_select_like(sql: str) -> bool:
    remainder = sql
    while True:
        trimmed = remainder.lstrip()
        if trimmed.startswith("--"):
            idx = trimmed.find("\n")
            remainder = "" if idx == -1 else trimmed[idx + 1 :]
            continue
        if trimmed.startswith("/*"):
            idx = trimmed.find("*/")
            remainder = "" if idx == -1 else trimmed[idx + 2 :]
            continue
        remainder = trimmed
        break
    upper = remainder.upper()
    return upper.startswith("SELECT") or upper.startswith("WITH")


def run_case(schema: str, seed_sql: str, solution_sql: str, expected_type, expected_query):
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    if schema:
        cur.executescript(schema)
    if seed_sql:
        cur.executescript(seed_sql)
    conn.commit()

    clean_sql = solution_sql.strip()
    if clean_sql.endswith(";"):
        clean_sql = clean_sql[:-1]

    cur.execute(clean_sql)
    if is_select_like(clean_sql):
        rows = [dict(row) for row in cur.fetchall()]
    else:
        conn.commit()
        rows = []

    if expected_type == "state" and expected_query:
        cur.execute(expected_query)
        rows = [dict(row) for row in cur.fetchall()]

    conn.close()
    return rows


def generate_seed_sql(generator_src: str, seed: int) -> str:
    random.seed(seed)
    namespace: dict = {}
    exec(generator_src, namespace)  # noqa: S102
    generated = namespace.get("GENERATED_SEED")
    if not isinstance(generated, str):
        raise RuntimeError("generator.py must set GENERATED_SEED to a SQL string")
    return generated


def main() -> None:
    failures: list[str] = []

    for challenge_dir in sorted(CHALLENGES_DIR.glob("sql-cat-*")):
        tests_path = challenge_dir / "tests.json"
        solution_path = challenge_dir / "solution.sql"
        generator_path = challenge_dir / "generator.py"

        if not tests_path.exists() or not solution_path.exists():
            continue  # e.g. sql-cat-intro: isInfoOnly, no tests

        fixture = json.loads(tests_path.read_text(encoding="utf-8"))
        schema = fixture.get("schema")
        expected_type = fixture.get("expectedType")
        expected_query = fixture.get("expectedQuery")
        solution_sql = solution_path.read_text(encoding="utf-8")

        try:
            cases = []
            if generator_path.exists():
                generator_src = generator_path.read_text(encoding="utf-8")
                for i in range(1, NUM_CASES + 1):
                    seed_sql = generate_seed_sql(generator_src, i)
                    expected_rows = run_case(
                        schema, seed_sql, solution_sql, expected_type, expected_query
                    )
                    cases.append({"name": f"Тест {i}", "seed": seed_sql, "expected": expected_rows})
            else:
                # Legacy challenge (no generator.py): one fixed case, reusing the
                # existing static `seed`, with `expected` recomputed from solution.sql.
                seed_sql = fixture.get("seed")
                expected_rows = run_case(
                    schema, seed_sql, solution_sql, expected_type, expected_query
                )
                cases.append({"name": "Тест 1", "seed": seed_sql, "expected": expected_rows})
        except Exception as exc:  # noqa: BLE001
            failures.append(f"{challenge_dir.name}: {exc}")
            continue

        new_fixture = {
            "schema": schema,
            "seed": fixture.get("seed"),
            **({"expectedType": expected_type} if expected_type else {}),
            **({"expectedQuery": expected_query} if expected_query else {}),
            "cases": cases,
        }

        tests_path.write_text(
            json.dumps(new_fixture, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        print(f"OK  {challenge_dir.name}  ({len(cases)} cases)")

    if failures:
        print("\n--- FAILURES ---", file=sys.stderr)
        for f in failures:
            print(f, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
