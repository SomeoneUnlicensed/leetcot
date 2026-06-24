import unittest
import random
from collections import Counter


def _reference_is_anagram(s: str, t: str) -> bool:
    return Counter(s) == Counter(t)


def _shuffle_string(rng: random.Random, s: str) -> str:
    lst = list(s)
    rng.shuffle(lst)
    return ''.join(lst)


class TestValidAnagram(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_empty_both(self):
        self.assertEqual(is_anagram("", ""), _reference_is_anagram("", ""))

    def test_edge_empty_one(self):
        self.assertEqual(is_anagram("", "a"), False)
        self.assertEqual(is_anagram("a", ""), False)

    def test_edge_single_same(self):
        self.assertEqual(is_anagram("z", "z"), True)

    def test_edge_single_different(self):
        self.assertEqual(is_anagram("a", "b"), False)

    def test_edge_different_lengths(self):
        # Any pair with different lengths is never an anagram
        rng = random.Random(11)
        chars = 'abcdefghijklmnopqrstuvwxyz'
        for _ in range(10):
            len_s = rng.randint(1, 8)
            len_t = rng.randint(1, 8)
            while len_t == len_s:
                len_t = rng.randint(1, 8)
            s = ''.join(rng.choice(chars) for _ in range(len_s))
            t = ''.join(rng.choice(chars) for _ in range(len_t))
            self.assertFalse(
                is_anagram(s, t),
                msg=f"Different-length strings {s!r} and {t!r} cannot be anagrams",
            )

    # ── property: shuffled strings are always anagrams ───────────────────────
    def test_property_shuffled_are_anagrams(self):
        rng = random.Random(42)
        chars = 'abcdefghijklmnopqrstuvwxyz'
        for _ in range(30):
            length = rng.randint(1, 15)
            s = ''.join(rng.choice(chars) for _ in range(length))
            t = _shuffle_string(rng, s)
            self.assertTrue(
                is_anagram(s, t),
                msg=f"Shuffle of {s!r} → {t!r} should be an anagram",
            )

    # ── property: random pairs compared against reference ───────────────────
    def test_property_random_pairs(self):
        rng = random.Random(77)
        chars = 'abcde'  # small alphabet to get some true-anagram hits
        for _ in range(40):
            length = rng.randint(1, 10)
            s = ''.join(rng.choice(chars) for _ in range(length))
            t = ''.join(rng.choice(chars) for _ in range(length))
            expected = _reference_is_anagram(s, t)
            self.assertEqual(
                is_anagram(s, t), expected,
                msg=f"Mismatch for is_anagram({s!r}, {t!r}): expected {expected}",
            )


if __name__ == '__main__':
    unittest.main()
