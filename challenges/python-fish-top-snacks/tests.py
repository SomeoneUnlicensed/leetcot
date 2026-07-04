import unittest


class TestTopSnacks(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(top_snacks(["fish", "milk", "fish", "tea"], 2), ["fish", "milk"])
        self.assertEqual(top_snacks(["b", "a", "b", "a"], 1), ["a"])
        self.assertEqual(top_snacks([], 3), [])


if __name__ == '__main__':
    unittest.main()
