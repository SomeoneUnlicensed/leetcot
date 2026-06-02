import unittest

class TestFishTwoSum(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(two_fish([2, 7, 11, 15], 9), [0, 1])
        self.assertEqual(two_fish([3, 2, 4], 6), [1, 2])
        self.assertEqual(two_fish([3, 3], 6), [0, 1])

if __name__ == '__main__':
    unittest.main()
