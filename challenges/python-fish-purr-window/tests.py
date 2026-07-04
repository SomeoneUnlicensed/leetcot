import unittest


class TestLongestPurr(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(longest_purr("abcabcbb"), 3)
        self.assertEqual(longest_purr("bbbbb"), 1)
        self.assertEqual(longest_purr("pwwkew"), 3)

    def test_edges(self):
        self.assertEqual(longest_purr(""), 0)
        self.assertEqual(longest_purr("abcdef"), 6)


if __name__ == '__main__':
    unittest.main()
