import unittest


class TestDedupOrder(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(unique_in_order(["a", "b", "a", "c", "b"]), ["a", "b", "c"])
        self.assertEqual(unique_in_order([]), [])
        self.assertEqual(unique_in_order([1, 1, 1]), [1])


if __name__ == '__main__':
    unittest.main()
