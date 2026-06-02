import unittest

class TestFishSlidingWindow(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(longest_laser_track("abcabcbb"), 3)
        self.assertEqual(longest_laser_track("bbbbb"), 1)
        self.assertEqual(longest_laser_track("pwwkew"), 3)
        
    def test_empty(self):
        self.assertEqual(longest_laser_track(""), 0)

if __name__ == '__main__':
    unittest.main()
