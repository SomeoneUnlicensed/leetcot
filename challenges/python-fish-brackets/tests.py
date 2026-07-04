import unittest


class TestBrackets(unittest.TestCase):
    def test_examples(self):
        self.assertTrue(is_valid_brackets("([])"))
        self.assertFalse(is_valid_brackets("([)]"))
        self.assertTrue(is_valid_brackets(""))
        self.assertFalse(is_valid_brackets("("))


if __name__ == '__main__':
    unittest.main()
