"""
Bakes a fixed bank of closed test cases into every python-fish-* challenge's
tests.py, replacing the old live-oracle marker section.

For each case, a fixed seed reseeds the challenge's generator.py (so the input
is reconstructed deterministically -- some inputs are non-JSON-serializable
objects like trees, so the generator has to run at grading time too) and the
*expected* output is computed once here, offline, by solution.py, then frozen
into the file. solution.py itself is never embedded in tests.py or run again
at grading time.

Usage: python scripts/generate-closed-tests/gen_python.py
"""

import json
import os
import random
import subprocess
import sys
from pathlib import Path

CHILD_ENV = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1"}

REPO_ROOT = Path(__file__).resolve().parents[2]
CHALLENGES_DIR = REPO_ROOT / "challenges"
MARKER = "# ---LEETCOT-HIDDEN-TESTS---"
OLD_MARKER = "# ---LEETCOT-ORACLE---"
NUM_CASES = 40

# Mirrors the normalize()/run_callable() logic baked into
# apps/code-runner/src/index.ts's buildPythonClosedTestProgram, so the
# "expected" value frozen here compares equal to what the runtime computes.
WORKER_TEMPLATE = r"""
import copy
import json
import random
import sys

SOLUTION_SRC = {solution_src!r}
GENERATOR_SRC = {generator_src!r}
ENTRY_POINT = {entry_point!r}
RESULT_ORDER_INSENSITIVE = {result_order_insensitive!r}
NUM_CASES = {num_cases!r}

SOL_NS = {{}}
exec(SOLUTION_SRC, SOL_NS)
GEN_NS = {{}}
exec(GENERATOR_SRC, GEN_NS)

solution_fn = SOL_NS[ENTRY_POINT]
generate_case = GEN_NS['generate_case']


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


def normalize(value):
    if hasattr(value, 'next'):
        result = []
        seen = 0
        while value is not None and seen < 10000:
            result.append(getattr(value, 'val', None))
            value = getattr(value, 'next', None)
            seen += 1
        return result
    if hasattr(value, 'left') or hasattr(value, 'right'):
        return [
            getattr(value, 'val', None),
            normalize(getattr(value, 'left', None)),
            normalize(getattr(value, 'right', None)),
        ]
    if isinstance(value, (list, tuple)):
        items = [normalize(item) for item in value]
        if RESULT_ORDER_INSENSITIVE:
            try:
                return sorted(items, key=repr)
            except TypeError:
                return items
        return items
    if isinstance(value, dict):
        return {{key: normalize(value[key]) for key in value}}
    return value


cases = []
for i in range(1, NUM_CASES + 1):
    random.seed(i)
    args = generate_case()
    if not isinstance(args, tuple):
        args = (args,)
    actual = run_callable(solution_fn, copy.deepcopy(args))
    cases.append({{'name': f'Тест {{i}}', 'seed': i, 'expected': normalize(actual)}})

print(json.dumps(cases, ensure_ascii=False))
"""


def extract_entry_point(solution_source: str) -> str | None:
    import re

    match = re.search(r"^(?:def|class)\s+(\w+)\s*(?:\(|:)", solution_source, re.MULTILINE)
    return match.group(1) if match else None


def main() -> None:
    failures: list[str] = []

    for challenge_dir in sorted(CHALLENGES_DIR.glob("python-fish-*")):
        generator_path = challenge_dir / "generator.py"
        solution_path = challenge_dir / "solution.py"
        tests_path = challenge_dir / "tests.py"
        test_config_path = challenge_dir / "test-config.json"
        old_oracle_config_path = challenge_dir / "oracle-config.json"

        if not generator_path.exists() or not solution_path.exists() or not tests_path.exists():
            continue

        solution_src = solution_path.read_text(encoding="utf-8")
        generator_src = generator_path.read_text(encoding="utf-8")
        entry_point = extract_entry_point(solution_src)

        if not entry_point:
            failures.append(f"{challenge_dir.name}: no top-level def/class in solution.py")
            continue

        extra_config = {}
        if test_config_path.exists():
            extra_config = json.loads(test_config_path.read_text(encoding="utf-8"))
        elif old_oracle_config_path.exists():
            extra_config = json.loads(old_oracle_config_path.read_text(encoding="utf-8"))
            old_oracle_config_path.rename(test_config_path)

        result_order_insensitive = bool(extra_config.get("resultOrderInsensitive", False))

        worker_script = WORKER_TEMPLATE.format(
            solution_src=solution_src,
            generator_src=generator_src,
            entry_point=entry_point,
            result_order_insensitive=result_order_insensitive,
            num_cases=NUM_CASES,
        )

        proc = subprocess.run(
            [sys.executable, "-c", worker_script],
            capture_output=True,
            text=True,
            encoding="utf-8",
            env=CHILD_ENV,
        )
        if proc.returncode != 0:
            failures.append(f"{challenge_dir.name}: worker failed:\n{proc.stderr}")
            continue

        try:
            cases = json.loads(proc.stdout.strip().splitlines()[-1])
        except Exception as exc:  # noqa: BLE001
            failures.append(f"{challenge_dir.name}: could not parse worker output: {exc}")
            continue

        raw_tests = tests_path.read_text(encoding="utf-8")
        visible_prefix = raw_tests.split(MARKER)[0].split(OLD_MARKER)[0].rstrip()

        config = {
            "entryPoint": entry_point,
            "seedGenerator": generator_src,
            "cases": cases,
            **({"resultOrderInsensitive": True} if result_order_insensitive else {}),
        }

        new_tests = f"{visible_prefix}\n\n{MARKER}\n# {json.dumps(config, ensure_ascii=False)}\n"
        tests_path.write_text(new_tests, encoding="utf-8", newline="\n")
        print(f"OK  {challenge_dir.name}  ({len(cases)} cases)")

    if failures:
        print("\n--- FAILURES ---", file=sys.stderr)
        for failure in failures:
            print(failure, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
