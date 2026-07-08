"""
Sanity check: runs the exact same check loop apps/code-runner uses
(buildPythonClosedTestProgram) against every python-fish-* challenge's real
solution.py, to confirm the freshly baked closed-test bank actually accepts the
reference solution end to end (not just that generation didn't crash).
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CHALLENGES_DIR = REPO_ROOT / "challenges"
MARKER = "# ---LEETCOT-HIDDEN-TESTS---"
CHILD_ENV = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1"}

CHECK_TEMPLATE = r"""
import copy
import json
import random
import sys

USER_NS = {{}}
exec({user_code!r}, USER_NS)

GEN_NS = {{}}
exec({seed_generator!r}, GEN_NS)

ENTRY_POINT = {entry_point!r}
RESULT_ORDER_INSENSITIVE = {result_order_insensitive!r}
FIXED_CASES = json.loads({fixed_cases_json!r})
CASES = json.loads({cases_json!r})
TOTAL = len(CASES)

def short_repr(value):
    text = repr(value)
    return text if len(text) <= 220 else text[:217] + '...'

def finish(success, passed, cases=None):
    print(json.dumps({{'passed': passed, 'total': TOTAL, 'cases': cases or []}}, ensure_ascii=False))
    sys.exit(0 if success else 1)

def failed_case(name, message):
    return {{'name': name, 'passed': False, 'message': message}}

user_fn = USER_NS.get(ENTRY_POINT)
generate_case = GEN_NS.get('generate_case')

if user_fn is None:
    finish(False, 0, [failed_case('setup', 'entry point missing')])
if generate_case is None or TOTAL == 0:
    finish(False, 0, [failed_case('setup', 'bad config')])

def normalize(value, depth=0):
    if hasattr(value, 'next'):
        result = []
        seen = 0
        while value is not None and seen < 10000:
            result.append(getattr(value, 'val', None))
            value = getattr(value, 'next', None)
            seen += 1
        return result
    if hasattr(value, 'left') or hasattr(value, 'right'):
        return [getattr(value, 'val', None), normalize(getattr(value, 'left', None), depth + 1), normalize(getattr(value, 'right', None), depth + 1)]
    if isinstance(value, (list, tuple)):
        items = [normalize(item, depth + 1) for item in value]
        if RESULT_ORDER_INSENSITIVE and depth == 0:
            try:
                return sorted(items, key=repr)
            except TypeError:
                return items
        return items
    if isinstance(value, dict):
        return {{key: normalize(value[key], depth + 1) for key in value}}
    return value

def run_callable(obj, args):
    if ENTRY_POINT == 'FeedingQueue':
        queue = obj()
        output = []
        values = list(args[0])
        for index, value in enumerate(values):
            queue.add_cat(value)
            if index % 3 == 1:
                output.append(queue.feed_next())
        while True:
            value = queue.feed_next()
            output.append(value)
            if value is None:
                break
        return output
    return obj(*args)

for index, case in enumerate(CASES):
    if index < len(FIXED_CASES):
        args = tuple(FIXED_CASES[index])
    else:
        random.seed(case['seed'])
        args = generate_case()
    if not isinstance(args, tuple):
        args = (args,)
    user_args = copy.deepcopy(args)
    try:
        actual = run_callable(user_fn, user_args)
    except Exception as exc:
        finish(False, index, [failed_case(case['name'], f'crashed: {{exc}}')])
    normalized_actual = normalize(actual)
    normalized_expected = normalize(case['expected'])
    if normalized_actual != normalized_expected:
        finish(False, index, [failed_case(case['name'], f'expected {{short_repr(normalized_expected)}}, got {{short_repr(normalized_actual)}}')])

finish(True, TOTAL)
"""


def main() -> None:
    failures = []
    for challenge_dir in sorted(CHALLENGES_DIR.glob("python-fish-*")):
        tests_path = challenge_dir / "tests.py"
        solution_path = challenge_dir / "solution.py"
        if not tests_path.exists() or not solution_path.exists():
            continue

        raw = tests_path.read_text(encoding="utf-8")
        if MARKER not in raw:
            continue

        rest = raw.split(MARKER)[1]
        json_line = next(
            line for line in rest.splitlines() if line.strip().startswith("#") and "{" in line
        )
        config = json.loads(json_line.strip()[1:].strip())
        user_code = solution_path.read_text(encoding="utf-8")

        script = CHECK_TEMPLATE.format(
            user_code=user_code,
            seed_generator=config["seedGenerator"],
            entry_point=config["entryPoint"],
            result_order_insensitive=bool(
                config.get("resultOrderInsensitive", False)
                or config["entryPoint"] == "toy_permutations"
            ),
            fixed_cases_json=json.dumps(config.get("fixedCases", []), ensure_ascii=False),
            cases_json=json.dumps(config["cases"], ensure_ascii=False),
        )

        with tempfile.NamedTemporaryFile(
            "w", suffix=".py", delete=False, encoding="utf-8"
        ) as tmp:
            tmp.write(script)
            tmp_path = tmp.name
        try:
            proc = subprocess.run(
                [sys.executable, tmp_path],
                capture_output=True,
                text=True,
                encoding="utf-8",
                env=CHILD_ENV,
            )
        finally:
            os.unlink(tmp_path)
        last_line = proc.stdout.strip().splitlines()[-1] if proc.stdout.strip() else ""
        try:
            summary = json.loads(last_line)
        except Exception:
            failures.append(f"{challenge_dir.name}: no summary, stderr={proc.stderr[:300]}")
            continue

        if summary["passed"] != summary["total"]:
            failures.append(f"{challenge_dir.name}: {summary['passed']}/{summary['total']} — {summary.get('cases')}")
        else:
            print(f"OK  {challenge_dir.name}  {summary['passed']}/{summary['total']}")

    if failures:
        print("\n--- FAILURES ---", file=sys.stderr)
        for f in failures:
            print(f, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
