import unittest

class TestFishGraph(unittest.TestCase):
    def test_simple(self):
        graph = {
            'A': ['B', 'C'],
            'B': ['A', 'D'],
            'C': ['A', 'F'],
            'D': ['B'],
            'F': ['C']
        }
        self.assertEqual(find_shortest_path(graph, 'A', 'F'), 2)
        
    def test_no_path(self):
        graph = {'A': ['B'], 'B': ['A'], 'C': []}
        self.assertEqual(find_shortest_path(graph, 'A', 'C'), -1)

if __name__ == '__main__':
    unittest.main()
