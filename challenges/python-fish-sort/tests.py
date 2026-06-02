import unittest

class TestSortFish(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(sort_fish([5, 2, 9, 1, 5, 6]), [9, 6, 5, 5, 2, 1])
        
    def test_empty(self):
        self.assertEqual(sort_fish([]), [])
        
    def test_single(self):
        self.assertEqual(sort_fish([10]), [10])
        
    def test_duplicates(self):
        self.assertEqual(sort_fish([1, 1, 1]), [1, 1, 1])

if __name__ == '__main__':
    unittest.main()
