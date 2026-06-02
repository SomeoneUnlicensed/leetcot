import unittest

class TestFishDP(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(max_sausages([1, 2, 3, 1]), 4)
        self.assertEqual(max_sausages([2, 7, 9, 3, 1]), 12)
        
    def test_empty(self):
        self.assertEqual(max_sausages([]), 0)
        
    def test_single(self):
        self.assertEqual(max_sausages([5]), 5)

if __name__ == '__main__':
    unittest.main()
