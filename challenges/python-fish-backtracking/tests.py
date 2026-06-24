import unittest
import random
import math


def _reference_toy_permutations(nums: list) -> list:
    """Return all permutations of nums."""
    if len(nums) <= 1:
        return [list(nums)]
    result = []
    for i, v in enumerate(nums):
        rest = nums[:i] + nums[i + 1:]
        for perm in _reference_toy_permutations(rest):
            result.append([v] + perm)
    return result


class TestFishBacktracking(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_empty(self):
        result = toy_permutations([])
        # Either [] or [[]] is acceptable – must have exactly 1 permutation of empty
        self.assertEqual(len(result), 1)

    def test_edge_single(self):
        rng = random.Random(5)
        for _ in range(10):
            v = rng.randint(0, 100)
            result = toy_permutations([v])
            self.assertEqual(len(result), 1)
            self.assertEqual(result[0], [v])

    # ── property: correct count of permutations ───────────────────────────────
    def test_property_count(self):
        rng = random.Random(42)
        for n in range(1, 7):
            nums = random.Random(n * 100).sample(range(200), n)
            result = toy_permutations(nums)
            expected_count = math.factorial(n)
            self.assertEqual(
                len(result), expected_count,
                msg=f"toy_permutations({nums}) should have {expected_count} permutations, got {len(result)}",
            )

    # ── property: all permutations are distinct ──────────────────────────────
    def test_property_all_distinct(self):
        rng = random.Random(77)
        for _ in range(20):
            n = rng.randint(2, 6)
            nums = rng.sample(range(50), n)  # unique elements
            result = toy_permutations(nums)
            as_tuples = [tuple(p) for p in result]
            self.assertEqual(
                len(as_tuples), len(set(as_tuples)),
                msg=f"Duplicate permutations found for {nums}",
            )

    # ── property: each permutation is a valid rearrangement ──────────────────
    def test_property_each_is_valid_rearrangement(self):
        rng = random.Random(13)
        for _ in range(20):
            n = rng.randint(1, 5)
            nums = rng.sample(range(30), n)
            result = toy_permutations(nums)
            sorted_nums = sorted(nums)
            for perm in result:
                self.assertEqual(
                    sorted(perm), sorted_nums,
                    msg=f"Permutation {perm} is not a rearrangement of {nums}",
                )

    # ── property: matches reference output (same set of permutations) ─────────
    def test_property_matches_reference(self):
        rng = random.Random(99)
        for _ in range(15):
            n = rng.randint(1, 5)
            nums = rng.sample(range(20), n)
            result = toy_permutations(nums)
            expected = _reference_toy_permutations(nums)
            self.assertEqual(
                sorted(map(tuple, result)), sorted(map(tuple, expected)),
                msg=f"Mismatch on toy_permutations({nums})",
            )

    # ── property: no permutation contains extra or missing elements ───────────
    def test_property_length_of_each_permutation(self):
        rng = random.Random(33)
        for _ in range(20):
            n = rng.randint(1, 6)
            nums = rng.sample(range(50), n)
            result = toy_permutations(nums)
            for perm in result:
                self.assertEqual(
                    len(perm), n,
                    msg=f"Permutation {perm} has wrong length for input {nums}",
                )


if __name__ == '__main__':
    unittest.main()
