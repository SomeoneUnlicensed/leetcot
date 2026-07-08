"""
Runs every go-cat-* reference solution against its tests.go file.

This catches broken visible tests, stale hidden banks and mismatches between a
task statement's reference implementation and the baked tests before deploy.
"""

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CHALLENGES_DIR = REPO_ROOT / "challenges"


def main() -> None:
    failures: list[str] = []

    for challenge_dir in sorted(CHALLENGES_DIR.glob("go-cat-*")):
        solution_path = challenge_dir / "solution.go"
        tests_path = challenge_dir / "tests.go"
        if not solution_path.exists() or not tests_path.exists():
            continue

        with tempfile.TemporaryDirectory() as tmp:
            tmp_dir = Path(tmp)
            shutil.copy(solution_path, tmp_dir / "solution.go")
            shutil.copy(tests_path, tmp_dir / "solution_test.go")

            proc = subprocess.run(
                ["go", "test", "-run", ".", "-count=1"],
                cwd=tmp_dir,
                capture_output=True,
                env={**os.environ, "GO111MODULE": "off"},
                text=True,
                timeout=60,
            )

        if proc.returncode != 0:
            failures.append(
                f"{challenge_dir.name}:\n{proc.stdout[-3000:]}\n{proc.stderr[-1500:]}"
            )
        else:
            print(f"OK  {challenge_dir.name}")

    if failures:
        print("\n--- FAILURES ---", file=sys.stderr)
        for failure in failures:
            print(failure, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
