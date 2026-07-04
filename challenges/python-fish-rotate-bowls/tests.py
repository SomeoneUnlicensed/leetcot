import unittest


class TestRotateBowls(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(rotate_bowls([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3])
        self.assertEqual(rotate_bowls([7, 8, 9], 3), [7, 8, 9])
        self.assertEqual(rotate_bowls([], 10), [])

    def test_large_shift(self):
        self.assertEqual(rotate_bowls(['a', 'b', 'c'], 10), ['c', 'a', 'b'])
        self.assertEqual(rotate_bowls([1], 99), [1])


if __name__ == '__main__':
    unittest.main()
