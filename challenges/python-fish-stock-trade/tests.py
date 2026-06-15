import unittest

class TestStockTrade(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(max_profit([7, 1, 5, 3, 6, 4]), 5)
        self.assertEqual(max_profit([7, 6, 4, 3, 1]), 0)
        self.assertEqual(max_profit([2, 4, 1]), 2)
        self.assertEqual(max_profit([1, 2]), 1)

    def test_empty(self):
        self.assertEqual(max_profit([]), 0)

if __name__ == '__main__':
    unittest.main()
