"""
Sanity check: runs the exact same check loop apps/code-runner uses
(buildSqlProgram) against every sql-cat-* challenge's real solution.sql, to
confirm the freshly baked closed-test bank actually accepts the reference
solution end to end.
"""

import json
import sqlite3
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CHALLENGES_DIR = REPO_ROOT / "challenges"


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


def run_query(schema, seed_sql, query, expected_type, expected_query):
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    if schema:
        cur.executescript(schema)
    if seed_sql:
        cur.executescript(seed_sql)
    conn.commit()

    clean_sql = query.strip()
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


def _num(value):
    if isinstance(value, bool):
        raise TypeError("not numeric")
    return float(value)


def rows_match(actual, expected):
    if len(actual) != len(expected):
        return False
    for a, e in zip(actual, expected):
        for key, ev in e.items():
            av = a.get(key)
            if isinstance(av, str) and isinstance(ev, str):
                if av.lower() != ev.lower():
                    return False
                continue
            try:
                if abs(_num(av) - _num(ev)) > 0.001:
                    return False
                continue
            except (TypeError, ValueError):
                pass
            if str(av) != str(ev):
                return False
    return True


def main() -> None:
    failures = []
    for challenge_dir in sorted(CHALLENGES_DIR.glob("sql-cat-*")):
        tests_path = challenge_dir / "tests.json"
        solution_path = challenge_dir / "solution.sql"
        if not tests_path.exists() or not solution_path.exists():
            continue

        fixture = json.loads(tests_path.read_text(encoding="utf-8"))
        cases = fixture.get("cases") or []
        if not cases:
            failures.append(f"{challenge_dir.name}: no cases")
            continue

        solution_sql = solution_path.read_text(encoding="utf-8")
        schema = fixture.get("schema")
        expected_type = fixture.get("expectedType")
        expected_query = fixture.get("expectedQuery")

        passed = 0
        first_failure = None
        for case in cases:
            try:
                actual = run_query(
                    schema, case.get("seed"), solution_sql, expected_type, expected_query
                )
            except Exception as exc:  # noqa: BLE001
                first_failure = f"crashed: {exc}"
                break
            if not rows_match(actual, case["expected"]):
                first_failure = f"expected {case['expected']}, got {actual}"
                break
            passed += 1

        if first_failure:
            failures.append(f"{challenge_dir.name}: {passed}/{len(cases)} — {first_failure}")
        else:
            print(f"OK  {challenge_dir.name}  {passed}/{len(cases)}")

    if failures:
        print("\n--- FAILURES ---", file=sys.stderr)
        for f in failures:
            print(f, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
