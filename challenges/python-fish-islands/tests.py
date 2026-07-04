import unittest


class TestIslands(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(count_islands([[1, 1, 0], [0, 1, 0], [1, 0, 1]]), 3)
        self.assertEqual(count_islands([]), 0)
        self.assertEqual(count_islands([[0, 0], [0, 0]]), 0)
        self.assertEqual(count_islands([[1, 1], [1, 1]]), 1)


if __name__ == '__main__':
    unittest.main()
