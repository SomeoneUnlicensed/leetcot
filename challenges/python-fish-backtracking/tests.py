import unittest

class TestFishBacktracking(unittest.TestCase):
    def test_basic(self):
        res = toy_permutations([1, 2])
        self.assertIn([1, 2], res)
        self.assertIn([2, 1], res)
        self.assertEqual(len(res), 2)
        
    def test_three(self):
        res = toy_permutations([1, 2, 3])
        self.assertEqual(len(res), 6)

if __name__ == '__main__':
    unittest.main()
