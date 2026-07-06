# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "shortest_grid_path"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"shortest_grid_path","referenceSolution":"from collections import deque\n\n\ndef shortest_grid_path(grid):\n    if not grid or not grid[0] or grid[0][0] == 1:\n        return -1\n    rows = len(grid)\n    cols = len(grid[0])\n    if grid[rows - 1][cols - 1] == 1:\n        return -1\n    queue = deque([(0, 0, 1)])\n    seen = {(0, 0)}\n    while queue:\n        r, c, dist = queue.popleft()\n        if r == rows - 1 and c == cols - 1:\n            return dist\n        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n            nr = r + dr\n            nc = c + dc\n            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:\n                seen.add((nr, nc))\n                queue.append((nr, nc, dist + 1))\n    return -1\n","seedGenerator":"import random\n\n\ndef generate_case():\n    rows = random.randint(0, 7)\n    cols = random.randint(0, 7)\n    if rows == 0 or cols == 0:\n        return ([],)\n    grid = [[1 if random.random() < 0.3 else 0 for _ in range(cols)] for _ in range(rows)]\n    return (grid,)\n"}
