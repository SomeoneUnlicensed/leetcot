import unittest


class TestKittenScores(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(best_scores([("Mira", 7), ("Mira", 9), ("Bars", 5)]), {"Mira": 9, "Bars": 5})
        self.assertEqual(best_scores([]), {})

    def test_negative_scores(self):
        self.assertEqual(best_scores([("A", -3), ("A", -5), ("B", 0)]), {"A": -3, "B": 0})


if __name__ == '__main__':
    unittest.main()
