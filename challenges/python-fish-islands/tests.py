# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "count_islands"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"count_islands","referenceSolution":"def count_islands(grid):\n    if not grid or not grid[0]:\n        return 0\n    rows = len(grid)\n    cols = len(grid[0])\n    seen = set()\n\n    def dfs(r, c):\n        if r < 0 or c < 0 or r >= rows or c >= cols:\n            return\n        if grid[r][c] == 0 or (r, c) in seen:\n            return\n        seen.add((r, c))\n        dfs(r + 1, c)\n        dfs(r - 1, c)\n        dfs(r, c + 1)\n        dfs(r, c - 1)\n\n    total = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == 1 and (r, c) not in seen:\n                total += 1\n                dfs(r, c)\n    return total\n","seedGenerator":"import random\n\n\ndef generate_case():\n    rows = random.randint(0, 8)\n    cols = random.randint(0, 8)\n    if rows == 0 or cols == 0:\n        return ([],)\n    grid = [[random.randint(0, 1) for _ in range(cols)] for _ in range(rows)]\n    return (grid,)\n"}
