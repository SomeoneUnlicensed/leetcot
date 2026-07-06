import random

def generate_case():
    n = random.randint(2, 8)
    nodes = [chr(ord('A') + i) for i in range(n)]
    graph = {node: {} for node in nodes}
    for i in range(n - 1):
        w = random.randint(1, 9)
        graph[nodes[i]][nodes[i + 1]] = w
        graph[nodes[i + 1]][nodes[i]] = w
    for i in range(n):
        for j in range(i + 2, n):
            if random.random() < 0.25:
                w = random.randint(1, 15)
                graph[nodes[i]][nodes[j]] = w
                graph[nodes[j]][nodes[i]] = w
    if random.random() < 0.15:
        graph['Z'] = {}
        return (graph, nodes[0], 'Z')
    return (graph, random.choice(nodes), random.choice(nodes))
