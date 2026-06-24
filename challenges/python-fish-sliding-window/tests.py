import unittest
import random


def _reference_longest_laser_track(s: str) -> int:
    """Sliding-window O(n) solution for longest substring without repeating chars."""
    char_index: dict = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in char_index and char_index[ch] >= left:
            left = char_index[ch] + 1
        char_index[ch] = right
        best = max(best, right - left + 1)
    return best


def _build_no_repeat_string(rng: random.Random, length: int) -> str:
    """Build a string of the given length where all chars are distinct."""
    chars = list('abcdefghijklmnopqrstuvwxyz0123456789')
    rng.shuffle(chars)
    return ''.join(chars[:length])


class TestFishSlidingWindow(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_empty(self):
        self.assertEqual(longest_laser_track(""), 0)

    def test_edge_single_char(self):
        self.assertEqual(longest_laser_track("x"), 1)

    def test_edge_all_same(self):
        # All identical characters → longest substring = 1
        for ch in ('a', 'z', '1'):
            s = ch * random.Random(5).randint(2, 15)
            self.assertEqual(
                longest_laser_track(s), 1,
                msg=f"All-same string {s!r} should yield 1",
            )

    def test_edge_all_unique(self):
        # A string with all unique chars → answer equals its length
        rng = random.Random(13)
        for _ in range(10):
            length = rng.randint(2, 20)
            s = _build_no_repeat_string(rng, length)
            self.assertEqual(
                longest_laser_track(s), length,
                msg=f"All-unique string {s!r} should yield {length}",
            )

    # ── property: random strings compared against reference ─────────────────
    def test_property_random_strings(self):
        rng = random.Random(42)
        chars = 'abcdefghijklmnopqrstuvwxyz'
        for _ in range(40):
            length = rng.randint(1, 30)
            s = ''.join(rng.choice(chars) for _ in range(length))
            expected = _reference_longest_laser_track(s)
            self.assertEqual(
                longest_laser_track(s), expected,
                msg=f"Mismatch on {s!r}: expected {expected}",
            )

    # ── property: result never exceeds string length ─────────────────────────
    def test_property_result_bounded(self):
        rng = random.Random(99)
        chars = 'abc'  # small alphabet → lots of repeats
        for _ in range(20):
            s = ''.join(rng.choice(chars) for _ in range(rng.randint(1, 20)))
            result = longest_laser_track(s)
            self.assertGreaterEqual(result, 1, msg=f"Result must be >= 1 for non-empty {s!r}")
            self.assertLessEqual(result, len(s), msg=f"Result must be <= len(s) for {s!r}")


if __name__ == '__main__':
    unittest.main()
