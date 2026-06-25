import unittest
import random
import re


def _reference_is_palindrome(s: str) -> bool:
    filtered = re.sub(r'[^a-zA-Z0-9]', '', s).lower()
    return filtered == filtered[::-1]


def _random_palindrome(rng: random.Random, length: int) -> str:
    """Generate a guaranteed palindrome string (alphanumeric only)."""
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    half = [rng.choice(chars) for _ in range(length // 2)]
    middle = [rng.choice(chars)] if length % 2 else []
    core = half + middle + half[::-1]
    # Optionally inject some non-alphanumeric noise
    result = list(''.join(core))
    noise_positions = sorted(rng.sample(range(len(result) + 1), min(3, len(result) + 1)))
    for offset, pos in enumerate(noise_positions):
        result.insert(pos + offset, rng.choice(' ,.!?'))
    return ''.join(result)


def _random_non_palindrome(rng: random.Random, min_len: int = 4) -> str:
    """Generate a string that is guaranteed NOT to be a palindrome."""
    chars = 'abcdefghijklmnopqrstuvwxyz'
    while True:
        length = rng.randint(min_len, 10)
        s = ''.join(rng.choice(chars) for _ in range(length))
        if s != s[::-1]:
            return s


class TestFishPalindrome(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_empty(self):
        self.assertTrue(is_palindrome_cat(""))

    def test_edge_single_char(self):
        self.assertTrue(is_palindrome_cat("a"))

    def test_edge_only_non_alphanumeric(self):
        # A string with only spaces/punctuation collapses to "" → palindrome
        self.assertTrue(is_palindrome_cat("   "))
        self.assertTrue(is_palindrome_cat(",.!?"))

    # ── property: palindromes ────────────────────────────────────────────────
    def test_property_palindromes(self):
        rng = random.Random(42)
        for _ in range(30):
            s = _random_palindrome(rng, rng.randint(1, 12))
            expected = _reference_is_palindrome(s)
            self.assertEqual(
                is_palindrome_cat(s), expected,
                msg=f"Expected palindrome check of {s!r} to be {expected}",
            )

    # ── property: non-palindromes ────────────────────────────────────────────
    def test_property_non_palindromes(self):
        rng = random.Random(7)
        for _ in range(20):
            s = _random_non_palindrome(rng)
            expected = _reference_is_palindrome(s)
            self.assertEqual(
                is_palindrome_cat(s), expected,
                msg=f"Expected palindrome check of {s!r} to be {expected}",
            )

    # ── property: random mixed strings ──────────────────────────────────────
    def test_property_random_strings(self):
        rng = random.Random(99)
        all_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.:;!?'
        for _ in range(30):
            length = rng.randint(0, 20)
            s = ''.join(rng.choice(all_chars) for _ in range(length))
            expected = _reference_is_palindrome(s)
            self.assertEqual(
                is_palindrome_cat(s), expected,
                msg=f"Mismatch on string {s!r}: expected {expected}",
            )


if __name__ == '__main__':
    unittest.main()
