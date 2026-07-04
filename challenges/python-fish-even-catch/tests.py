import unittest


class TestEvenCatch(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(count_even_fish([1, 2, 4, 7]), 2)
        self.assertEqual(count_even_fish([]), 0)
        self.assertEqual(count_even_fish([-2, -1, 0, 3]), 2)


if __name__ == '__main__':
    unittest.main()
