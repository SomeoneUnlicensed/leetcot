import random
import unittest


def _reference_find_sausage(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


class TestFishBinarySearch(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(find_sausage([], 5), -1)

    def test_known_cases(self):
        self.assertEqual(find_sausage([1, 3, 5, 7, 9], 3), 1)
        self.assertEqual(find_sausage([1, 3, 5, 7, 9], 1), 0)
        self.assertEqual(find_sausage([1, 3, 5, 7, 9], 9), 4)
        self.assertEqual(find_sausage([1, 3, 5, 7, 9], 2), -1)

    def test_random_found(self):
        """Случайные отсортированные массивы, target гарантированно есть."""
        rng = random.Random(42424)
        for _ in range(40):
            size = rng.randint(1, 30)
            arr = sorted(set(rng.randint(-200, 200) for _ in range(size)))
            target = rng.choice(arr)
            result = find_sausage(arr, target)
            self.assertEqual(
                arr[result],
                target,
                msg=f"find_sausage({arr}, {target}) вернул {result}, но arr[{result}]={arr[result] if 0 <= result < len(arr) else 'out of range'}",
            )

    def test_random_not_found(self):
        """Target гарантированно отсутствует."""
        rng = random.Random(13579)
        for _ in range(30):
            arr = sorted(set(rng.randint(0, 100) for _ in range(rng.randint(1, 20))))
            # Ищем значение за пределами диапазона
            target = max(arr) + rng.randint(1, 50)
            self.assertEqual(find_sausage(arr, target), -1)

    def test_boundaries(self):
        """Элемент на первой и последней позиции."""
        rng = random.Random(77777)
        for _ in range(20):
            size = rng.randint(3, 25)
            arr = sorted(set(rng.randint(-1000, 1000) for _ in range(size + 5)))[:size]
            self.assertEqual(find_sausage(arr, arr[0]), 0)
            self.assertEqual(find_sausage(arr, arr[-1]), len(arr) - 1)


if __name__ == '__main__':
    unittest.main()
