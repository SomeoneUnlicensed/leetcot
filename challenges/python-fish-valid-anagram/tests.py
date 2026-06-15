import unittest

class TestValidAnagram(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(is_anagram("anagram", "nagaram"), True)
        self.assertEqual(is_anagram("rat", "car"), False)
        self.assertEqual(is_anagram("cat", "tac"), True)
        self.assertEqual(is_anagram("a", "ab"), False)

if __name__ == '__main__':
    unittest.main()
