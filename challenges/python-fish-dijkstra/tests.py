import unittest
import random
import heapq


def _reference_shortest_energy_path(graph: dict, start: str, end: str) -> float:
    """Dijkstra's algorithm. Returns float('inf') if unreachable."""
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    heap = [(0, start)]
    while heap:
        cost, node = heapq.heappop(heap)
        if cost > dist[node]:
            continue
        if node == end:
            return cost
        for neighbor, weight in graph.get(node, {}).items():
            new_cost = cost + weight
            if new_cost < dist[neighbor]:
                dist[neighbor] = new_cost
                heapq.heappush(heap, (new_cost, neighbor))
    return float('inf')


def _build_random_weighted_graph(rng: random.Random, node_count: int, edge_prob: float = 0.4,
                                  max_weight: int = 20):
    """Build a random undirected weighted graph."""
    nodes = [str(i) for i in range(node_count)]
    graph = {n: {} for n in nodes}
    for i in range(node_count):
        for j in range(i + 1, node_count):
            if rng.random() < edge_prob:
                w = rng.randint(1, max_weight)
                graph[nodes[i]][nodes[j]] = w
                graph[nodes[j]][nodes[i]] = w
    return graph, nodes


class TestFishDijkstra(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_same_node(self):
        graph = {'A': {'B': 5}, 'B': {'A': 5}}
        self.assertEqual(shortest_energy_path(graph, 'A', 'A'), 0)

    def test_edge_disconnected(self):
        graph = {'A': {'B': 1}, 'B': {'A': 1}, 'C': {}}
        self.assertEqual(shortest_energy_path(graph, 'A', 'C'), float('inf'))

    def test_edge_direct_edge(self):
        rng = random.Random(5)
        for _ in range(10):
            w = rng.randint(1, 100)
            graph = {'X': {'Y': w}, 'Y': {'X': w}}
            self.assertEqual(shortest_energy_path(graph, 'X', 'Y'), w,
                             msg=f"Direct edge weight {w} should be the shortest path")

    # ── property: random graphs vs reference Dijkstra ─────────────────────────
    def test_property_random_graphs(self):
        rng = random.Random(42)
        for _ in range(30):
            node_count = rng.randint(3, 8)
            graph, nodes = _build_random_weighted_graph(rng, node_count)
            start = rng.choice(nodes)
            end = rng.choice(nodes)
            expected = _reference_shortest_energy_path(graph, start, end)
            result = shortest_energy_path(graph, start, end)
            self.assertEqual(
                result, expected,
                msg=f"Mismatch: start={start!r}, end={end!r}, graph={graph}, expected={expected}",
            )

    # ── property: distance is symmetric for undirected graphs ─────────────────
    def test_property_symmetric(self):
        rng = random.Random(77)
        for _ in range(20):
            node_count = rng.randint(3, 8)
            graph, nodes = _build_random_weighted_graph(rng, node_count)
            a, b = rng.sample(nodes, 2)
            d_ab = shortest_energy_path(graph, a, b)
            d_ba = shortest_energy_path(graph, b, a)
            self.assertEqual(d_ab, d_ba,
                             msg=f"Expected symmetry: d({a},{b})={d_ab} vs d({b},{a})={d_ba}")

    # ── property: self distance is always 0 ──────────────────────────────────
    def test_property_self_zero(self):
        rng = random.Random(13)
        for _ in range(20):
            node_count = rng.randint(2, 8)
            graph, nodes = _build_random_weighted_graph(rng, node_count)
            node = rng.choice(nodes)
            self.assertEqual(shortest_energy_path(graph, node, node), 0,
                             msg=f"Distance from {node} to itself must be 0")

    # ── property: triangle inequality ────────────────────────────────────────
    def test_property_triangle_inequality(self):
        rng = random.Random(55)
        for _ in range(20):
            node_count = rng.randint(4, 8)
            graph, nodes = _build_random_weighted_graph(rng, node_count, edge_prob=0.6)
            a, b, c = rng.sample(nodes, 3)
            d_ac = shortest_energy_path(graph, a, c)
            d_ab = shortest_energy_path(graph, a, b)
            d_bc = shortest_energy_path(graph, b, c)
            if d_ac != float('inf') and d_ab != float('inf') and d_bc != float('inf'):
                self.assertLessEqual(
                    d_ac, d_ab + d_bc,
                    msg=f"Triangle ineq violated: d({a},{c})={d_ac} > {d_ab}+{d_bc}",
                )

    # ── property: shortest path <= direct edge weight (if it exists) ──────────
    def test_property_shortcut_not_shorter_than_direct(self):
        rng = random.Random(33)
        for _ in range(20):
            node_count = rng.randint(3, 8)
            graph, nodes = _build_random_weighted_graph(rng, node_count, edge_prob=0.7)
            a, b = rng.sample(nodes, 2)
            direct = graph[a].get(b, float('inf'))
            via_dijkstra = shortest_energy_path(graph, a, b)
            self.assertLessEqual(
                via_dijkstra, direct,
                msg=f"Dijkstra path ({via_dijkstra}) should be <= direct edge ({direct}) for {a}->{b}",
            )


if __name__ == '__main__':
    unittest.main()
