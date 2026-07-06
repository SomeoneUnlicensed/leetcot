# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "find_shortest_path"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"find_shortest_path","referenceSolution":"from collections import deque\r\n\r\ndef find_shortest_path(graph, start, end):\r\n    if start == end: return 0\r\n    queue = deque([(start, 0)])\r\n    visited = {start}\r\n    \r\n    while queue:\r\n        node, dist = queue.popleft()\r\n        for neighbor in graph.get(node, []):\r\n            if neighbor == end:\r\n                return dist + 1\r\n            if neighbor not in visited:\r\n                visited.add(neighbor)\r\n                queue.append((neighbor, dist + 1))\r\n    return -1\r\n","seedGenerator":"import random\n\ndef generate_case():\n    n = random.randint(1, 9)\n    nodes = [chr(ord('A') + i) for i in range(n)]\n    graph = {node: [] for node in nodes}\n    for i in range(n):\n        for j in range(i + 1, n):\n            if random.random() < 0.35:\n                graph[nodes[i]].append(nodes[j])\n                graph[nodes[j]].append(nodes[i])\n    return (graph, random.choice(nodes), random.choice(nodes))\n"}
