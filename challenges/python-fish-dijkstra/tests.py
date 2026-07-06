# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "shortest_energy_path"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"shortest_energy_path","referenceSolution":"import heapq\r\n\r\ndef shortest_energy_path(graph, start, target):\r\n    distances = {node: float('inf') for node in graph}\r\n    distances[start] = 0\r\n    pq = [(0, start)]\r\n    \r\n    while pq:\r\n        current_distance, current_node = heapq.heappop(pq)\r\n        \r\n        if current_distance > distances[current_node]:\r\n            continue\r\n            \r\n        if current_node == target:\r\n            return current_distance\r\n            \r\n        for neighbor, weight in graph.get(current_node, {}).items():\r\n            distance = current_distance + weight\r\n            if distance < distances[neighbor]:\r\n                distances[neighbor] = distance\r\n                heapq.heappush(pq, (distance, neighbor))\r\n                \r\n    return distances.get(target, float('inf'))\r\n","seedGenerator":"import random\n\ndef generate_case():\n    n = random.randint(2, 8)\n    nodes = [chr(ord('A') + i) for i in range(n)]\n    graph = {node: {} for node in nodes}\n    for i in range(n - 1):\n        w = random.randint(1, 9)\n        graph[nodes[i]][nodes[i + 1]] = w\n        graph[nodes[i + 1]][nodes[i]] = w\n    for i in range(n):\n        for j in range(i + 2, n):\n            if random.random() < 0.25:\n                w = random.randint(1, 15)\n                graph[nodes[i]][nodes[j]] = w\n                graph[nodes[j]][nodes[i]] = w\n    if random.random() < 0.15:\n        graph['Z'] = {}\n        return (graph, nodes[0], 'Z')\n    return (graph, random.choice(nodes), random.choice(nodes))\n"}
