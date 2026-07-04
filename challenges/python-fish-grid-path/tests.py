import unittest


class TestGridPath(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(shortest_grid_path([[0, 0], [1, 0]]), 3)
        self.assertEqual(shortest_grid_path([[0, 1], [1, 0]]), -1)
        self.assertEqual(shortest_grid_path([[0]]), 1)
        self.assertEqual(shortest_grid_path([]), -1)


if __name__ == '__main__':
    unittest.main()
