import unittest
import random
from collections import deque


def _reference_find_shortest_path(graph: dict, start: str, end: str) -> int:
    """BFS shortest path (unweighted). Returns -1 if unreachable."""
    if start == end:
        return 0
    visited = {start}
    queue = deque([(start, 0)])
    while queue:
        node, dist = queue.popleft()
        for neighbor in graph.get(node, []):
            if neighbor == end:
                return dist + 1
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist + 1))
    return -1


def _build_random_graph(rng: random.Random, node_count: int, edge_prob: float = 0.4):
    """Build a random undirected graph with string node labels."""
    nodes = [str(i) for i in range(node_count)]
    graph = {n: [] for n in nodes}
    for i in range(node_count):
        for j in range(i + 1, node_count):
            if rng.random() < edge_prob:
                graph[nodes[i]].append(nodes[j])
                graph[nodes[j]].append(nodes[i])
    return graph, nodes


class TestFishGraph(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_same_node(self):
        graph = {'A': ['B'], 'B': ['A']}
        self.assertEqual(find_shortest_path(graph, 'A', 'A'), 0)

    def test_edge_direct_neighbor(self):
        rng = random.Random(5)
        for _ in range(10):
            n = str(rng.randint(0, 9))
            m = str(rng.randint(0, 9))
            while m == n:
                m = str(rng.randint(0, 9))
            graph = {n: [m], m: [n]}
            self.assertEqual(find_shortest_path(graph, n, m), 1,
                             msg=f"Direct edge {n}-{m} should be distance 1")

    def test_edge_no_path(self):
        graph = {'A': ['B'], 'B': ['A'], 'C': [], 'D': ['C'], 'C': ['D']}
        self.assertEqual(find_shortest_path(graph, 'A', 'D'), -1)

    def test_edge_isolated_target(self):
        graph = {'A': ['B'], 'B': ['A', 'C'], 'C': ['B'], 'Z': []}
        self.assertEqual(find_shortest_path(graph, 'A', 'Z'), -1)

    # ── property: random graphs vs reference BFS ─────────────────────────────
    def test_property_random_graphs(self):
        rng = random.Random(42)
        for _ in range(30):
            node_count = rng.randint(3, 10)
            graph, nodes = _build_random_graph(rng, node_count)
            start = rng.choice(nodes)
            end = rng.choice(nodes)
            expected = _reference_find_shortest_path(graph, start, end)
            self.assertEqual(
                find_shortest_path(graph, start, end), expected,
                msg=f"Mismatch on graph={graph}, start={start!r}, end={end!r}: expected {expected}",
            )

    # ── property: distance is symmetric for undirected graphs ─────────────────
    def test_property_symmetric_distance(self):
        rng = random.Random(77)
        for _ in range(20):
            node_count = rng.randint(3, 8)
            graph, nodes = _build_random_graph(rng, node_count)
            a, b = rng.sample(nodes, 2)
            dist_ab = find_shortest_path(graph, a, b)
            dist_ba = find_shortest_path(graph, b, a)
            self.assertEqual(dist_ab, dist_ba,
                             msg=f"Distance should be symmetric: d({a},{b})={dist_ab}, d({b},{a})={dist_ba}")

    # ── property: distance(start, start) == 0 ────────────────────────────────
    def test_property_self_distance_zero(self):
        rng = random.Random(13)
        for _ in range(20):
            node_count = rng.randint(2, 8)
            graph, nodes = _build_random_graph(rng, node_count)
            node = rng.choice(nodes)
            self.assertEqual(
                find_shortest_path(graph, node, node), 0,
                msg=f"Distance from {node} to itself should be 0",
            )

    # ── property: triangle inequality ────────────────────────────────────────
    def test_property_triangle_inequality(self):
        rng = random.Random(55)
        for _ in range(20):
            node_count = rng.randint(4, 8)
            graph, nodes = _build_random_graph(rng, node_count, edge_prob=0.5)
            a, b, c = rng.sample(nodes, 3)
            d_ac = find_shortest_path(graph, a, c)
            d_ab = find_shortest_path(graph, a, b)
            d_bc = find_shortest_path(graph, b, c)
            if d_ac != -1 and d_ab != -1 and d_bc != -1:
                self.assertLessEqual(
                    d_ac, d_ab + d_bc,
                    msg=f"Triangle inequality violated: d({a},{c})={d_ac} > d({a},{b})+d({b},{c})={d_ab}+{d_bc}",
                )


if __name__ == '__main__':
    unittest.main()
