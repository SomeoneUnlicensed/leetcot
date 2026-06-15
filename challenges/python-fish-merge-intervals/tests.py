import unittest

class TestMergeIntervals(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]), [[1, 6], [8, 10], [15, 18]])
        self.assertEqual(merge_intervals([[1, 4], [4, 5]]), [[1, 5]])
        self.assertEqual(merge_intervals([[1, 4], [0, 4]]), [[0, 4]])
        self.assertEqual(merge_intervals([[1, 4], [2, 3]]), [[1, 4]])

    def test_empty(self):
        self.assertEqual(merge_intervals([]), [])

if __name__ == '__main__':
    unittest.main()
