import random
import unittest


class TestSortFish(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(sort_fish([]), [])

    def test_single(self):
        rng = random.Random(7)
        for _ in range(5):
            v = rng.randint(-1000, 1000)
            self.assertEqual(sort_fish([v]), [v])

    def test_known_cases(self):
        self.assertEqual(sort_fish([5, 2, 9, 1, 5, 6]), [9, 6, 5, 5, 2, 1])
        self.assertEqual(sort_fish([1, 1, 1]), [1, 1, 1])

    def test_random_arrays(self):
        """Случайные массивы — сортировка убывания сверяется с sorted()."""
        rng = random.Random(55555)
        for _ in range(50):
            size = rng.randint(1, 30)
            arr = [rng.randint(-500, 500) for _ in range(size)]
            expected = sorted(arr, reverse=True)
            result = sort_fish(arr[:])  # передаём копию
            self.assertEqual(
                result,
                expected,
                msg=f"sort_fish({arr}) должен вернуть {expected}",
            )

    def test_already_sorted(self):
        """Уже отсортированный массив (убывание и возрастание)."""
        rng = random.Random(8888)
        for _ in range(10):
            arr = sorted([rng.randint(-100, 100) for _ in range(rng.randint(2, 15))], reverse=True)
            self.assertEqual(sort_fish(arr[:]), arr)


if __name__ == '__main__':
    unittest.main()
