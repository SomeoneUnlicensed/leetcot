import unittest


class TestMaxStreak(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(longest_streak([1, 1, 2, 2, 2, 1]), 3)
        self.assertEqual(longest_streak([]), 0)
        self.assertEqual(longest_streak(["a"]), 1)


if __name__ == '__main__':
    unittest.main()
