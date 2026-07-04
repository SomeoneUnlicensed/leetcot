import unittest


class TestCompactBowls(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(compact_bowls([0, 3, 0, 2, 5]), [3, 2, 5, 0, 0])
        self.assertEqual(compact_bowls([1, 2, 3]), [1, 2, 3])
        self.assertEqual(compact_bowls([0, 0]), [0, 0])

    def test_edges(self):
        self.assertEqual(compact_bowls([]), [])
        self.assertEqual(compact_bowls([4, 0, -1, 0, 4]), [4, -1, 4, 0, 0])


if __name__ == '__main__':
    unittest.main()
