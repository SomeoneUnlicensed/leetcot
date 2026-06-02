import unittest

class TestFishPalindrome(unittest.TestCase):
    def test_valid(self):
        self.assertTrue(is_palindrome_cat("A man, a plan, a canal: Panama"))
        self.assertTrue(is_palindrome_cat(" "))
        
    def test_invalid(self):
        self.assertFalse(is_palindrome_cat("race a car"))

if __name__ == '__main__':
    unittest.main()
