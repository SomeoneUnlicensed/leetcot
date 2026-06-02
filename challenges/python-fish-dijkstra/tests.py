import unittest

class TestFishDijkstra(unittest.TestCase):
    def test_basic(self):
        graph = {
            'A': {'B': 1, 'C': 4},
            'B': {'A': 1, 'C': 2, 'D': 5},
            'C': {'A': 4, 'B': 2, 'D': 1},
            'D': {'B': 5, 'C': 1}
        }
        self.assertEqual(shortest_energy_path(graph, 'A', 'D'), 4)
        
    def test_disconnected(self):
        graph = {'A': {'B': 1}, 'B': {'A': 1}, 'C': {}}
        self.assertEqual(shortest_energy_path(graph, 'A', 'C'), float('inf'))

if __name__ == '__main__':
    unittest.main()
