import unittest


class TestSnackCounter(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(count_snacks(["fish", "milk", "fish"]), {"fish": 2, "milk": 1})
        self.assertEqual(count_snacks([]), {})

    def test_repeated(self):
        self.assertEqual(count_snacks(["a", "a", "a", "b"]), {"a": 3, "b": 1})


if __name__ == '__main__':
    unittest.main()
