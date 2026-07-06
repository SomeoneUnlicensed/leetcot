import random

def generate_case():
    n = random.randint(1, 9)
    nodes = [chr(ord('A') + i) for i in range(n)]
    graph = {node: [] for node in nodes}
    for i in range(n):
        for j in range(i + 1, n):
            if random.random() < 0.35:
                graph[nodes[i]].append(nodes[j])
                graph[nodes[j]].append(nodes[i])
    return (graph, random.choice(nodes), random.choice(nodes))
