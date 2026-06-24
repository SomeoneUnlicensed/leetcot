import random
import unittest


def _reference_two_fish(nums, target):
    """Эталонное решение."""
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []


class TestFishTwoSum(unittest.TestCase):
    def test_known_cases(self):
        """Базовые примеры из условия."""
        self.assertEqual(two_fish([2, 7, 11, 15], 9), [0, 1])
        self.assertEqual(two_fish([3, 2, 4], 6), [1, 2])
        self.assertEqual(two_fish([3, 3], 6), [0, 1])

    def test_random_cases(self):
        """Случайные массивы — результат сверяется с эталоном."""
        rng = random.Random(99991)
        for _ in range(40):
            size = rng.randint(2, 20)
            nums = [rng.randint(-100, 100) for _ in range(size)]
            # Гарантируем наличие решения: выбираем два случайных индекса
            i, j = sorted(rng.sample(range(size), 2))
            target = nums[i] + nums[j]
            expected = _reference_two_fish(nums, target)
            result = two_fish(nums, target)
            # Проверяем что индексы правильные (порядок [i,j] i<j)
            self.assertIsInstance(result, list)
            self.assertEqual(len(result), 2)
            r0, r1 = result
            self.assertLess(r0, r1)
            self.assertEqual(nums[r0] + nums[r1], target)

    def test_large(self):
        """Большой массив — проверка производительности и корректности."""
        rng = random.Random(12345)
        nums = list(range(1, 1001))
        rng.shuffle(nums)
        i, j = sorted(rng.sample(range(len(nums)), 2))
        target = nums[i] + nums[j]
        result = two_fish(nums, target)
        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 2)
        self.assertEqual(nums[result[0]] + nums[result[1]], target)


if __name__ == '__main__':
    unittest.main()
