import unittest
import random


def _reference_max_sausages(nums: list) -> int:
    """House Robber DP: max sum of non-adjacent elements."""
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    prev2, prev1 = 0, 0
    for n in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + n)
    return prev1


class TestFishDP(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_empty(self):
        self.assertEqual(max_sausages([]), 0)

    def test_edge_single(self):
        rng = random.Random(5)
        for _ in range(10):
            v = rng.randint(0, 100)
            self.assertEqual(max_sausages([v]), v,
                             msg=f"Single element [{v}] should return {v}")

    def test_edge_two_elements(self):
        rng = random.Random(6)
        for _ in range(10):
            a, b = rng.randint(0, 50), rng.randint(0, 50)
            expected = max(a, b)
            self.assertEqual(max_sausages([a, b]), expected,
                             msg=f"[{a}, {b}] → expected {expected}")

    def test_edge_all_zeros(self):
        self.assertEqual(max_sausages([0, 0, 0, 0]), 0)

    # ── property: random non-negative arrays ─────────────────────────────────
    def test_property_random_arrays(self):
        rng = random.Random(42)
        for _ in range(40):
            length = rng.randint(1, 25)
            nums = [rng.randint(0, 200) for _ in range(length)]
            expected = _reference_max_sausages(nums)
            self.assertEqual(
                max_sausages(nums), expected,
                msg=f"Mismatch on {nums}: expected {expected}",
            )

    # ── property: result >= any single element ────────────────────────────────
    def test_property_result_at_least_max_single(self):
        rng = random.Random(99)
        for _ in range(20):
            length = rng.randint(1, 15)
            nums = [rng.randint(0, 100) for _ in range(length)]
            result = max_sausages(nums)
            self.assertGreaterEqual(result, max(nums),
                                    msg=f"Result {result} should be >= max element {max(nums)} in {nums}")

    # ── property: monotone – adding positive value can only increase result ───
    def test_property_extending_with_zero_noop(self):
        rng = random.Random(88)
        for _ in range(20):
            length = rng.randint(2, 15)
            nums = [rng.randint(0, 100) for _ in range(length)]
            # Appending 0 should not decrease the result
            result_orig = max_sausages(nums)
            result_ext = max_sausages(nums + [0])
            self.assertGreaterEqual(result_ext, result_orig,
                                    msg=f"Appending 0 to {nums} unexpectedly changed result")


if __name__ == '__main__':
    unittest.main()
