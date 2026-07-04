import unittest


class TestPrefixPatrol(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(count_balanced_walks([1, -1, 1, -1]), 4)
        self.assertEqual(count_balanced_walks([1, 1, -1]), 1)
        self.assertEqual(count_balanced_walks([]), 0)

    def test_mixed_steps(self):
        self.assertEqual(count_balanced_walks([2, -2, 3, -1, -2]), 4)


if __name__ == '__main__':
    unittest.main()
