import unittest

class TestFishStack(unittest.TestCase):
    def test_valid(self):
        self.assertTrue(is_valid_boxes("()"))
        self.assertTrue(is_valid_boxes("()[]{}"))
        self.assertTrue(is_valid_boxes("{[]}"))
        
    def test_invalid(self):
        self.assertFalse(is_valid_boxes("(]"))
        self.assertFalse(is_valid_boxes("([)]"))
        self.assertFalse(is_valid_boxes("]"))

if __name__ == '__main__':
    unittest.main()
