import unittest


class TestRangeSummary(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(summarize_ranges([0, 1, 2, 4, 5, 7]), ["0->2", "4->5", "7"])
        self.assertEqual(summarize_ranges([]), [])
        self.assertEqual(summarize_ranges([-2, -1, 1]), ["-2->-1", "1"])


if __name__ == '__main__':
    unittest.main()
