import unittest
import random


def _reference_merge_intervals(intervals: list) -> list:
    if not intervals:
        return []
    sorted_ivs = sorted(intervals, key=lambda x: x[0])
    merged = [sorted_ivs[0][:]]
    for start, end in sorted_ivs[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged


def _random_intervals(rng: random.Random, count: int, max_val: int = 50) -> list:
    intervals = []
    for _ in range(count):
        a = rng.randint(0, max_val)
        b = rng.randint(a, min(a + rng.randint(1, 15), max_val + 15))
        intervals.append([a, b])
    return intervals


class TestMergeIntervals(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_empty(self):
        self.assertEqual(merge_intervals([]), [])

    def test_edge_single(self):
        rng = random.Random(5)
        for _ in range(10):
            a = rng.randint(0, 100)
            b = rng.randint(a, a + 20)
            self.assertEqual(merge_intervals([[a, b]]), [[a, b]],
                             msg=f"Single interval [[{a}, {b}]] should return as-is")

    # ── property: result is sorted ────────────────────────────────────────────
    def test_property_result_sorted(self):
        rng = random.Random(42)
        for _ in range(30):
            count = rng.randint(1, 15)
            intervals = _random_intervals(rng, count)
            result = merge_intervals(intervals)
            starts = [iv[0] for iv in result]
            self.assertEqual(starts, sorted(starts),
                             msg=f"Result starts are not sorted for input {intervals}")

    # ── property: no overlaps in result ─────────────────────────────────────
    def test_property_no_overlaps(self):
        rng = random.Random(77)
        for _ in range(30):
            count = rng.randint(2, 15)
            intervals = _random_intervals(rng, count)
            result = merge_intervals(intervals)
            for i in range(len(result) - 1):
                self.assertLess(
                    result[i][1], result[i + 1][0],
                    msg=f"Overlap found between {result[i]} and {result[i+1]} in result {result}",
                )

    # ── property: total coverage preserved ───────────────────────────────────
    def test_property_coverage_preserved(self):
        rng = random.Random(13)
        for _ in range(30):
            count = rng.randint(1, 10)
            intervals = _random_intervals(rng, count)
            result = merge_intervals(intervals)
            # Build covered sets (integers only for finite check)
            original_covered = set()
            for a, b in intervals:
                original_covered.update(range(a, b + 1))
            merged_covered = set()
            for a, b in result:
                merged_covered.update(range(a, b + 1))
            self.assertEqual(
                original_covered, merged_covered,
                msg=f"Coverage changed after merging {intervals}",
            )

    # ── property: matches reference on random inputs ─────────────────────────
    def test_property_matches_reference(self):
        rng = random.Random(99)
        for _ in range(40):
            count = rng.randint(0, 12)
            intervals = _random_intervals(rng, count)
            expected = _reference_merge_intervals(intervals)
            self.assertEqual(
                merge_intervals(intervals), expected,
                msg=f"Mismatch on {intervals}: expected {expected}",
            )


if __name__ == '__main__':
    unittest.main()
