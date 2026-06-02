import unittest

class TestFishBinarySearch(unittest.TestCase):
    def test_found(self):
        self.assertEqual(find_sausage([1, 3, 5, 7, 9], 3), 1)
        self.assertEqual(find_sausage([1, 3, 5, 7, 9], 1), 0)
        self.assertEqual(find_sausage([1, 3, 5, 7, 9], 9), 4)
        
    def test_not_found(self):
        self.assertEqual(find_sausage([1, 3, 5, 7, 9], 2), -1)
        self.assertEqual(find_sausage([], 5), -1)

if __name__ == '__main__':
    unittest.main()
