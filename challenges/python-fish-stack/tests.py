import unittest
import random


def _reference_is_valid_boxes(s: str) -> bool:
    stack = []
    matching = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in ')]}':
            if not stack or stack[-1] != matching[ch]:
                return False
            stack.pop()
    return len(stack) == 0


def _build_valid_brackets(rng: random.Random, depth: int = 0, max_depth: int = 5) -> str:
    """Recursively build a valid bracket string."""
    if depth >= max_depth or rng.random() < 0.15:
        return ''
    pairs = [('(', ')'), ('[', ']'), ('{', '}')]
    open_b, close_b = rng.choice(pairs)
    inner = _build_valid_brackets(rng, depth + 1, max_depth)
    suffix = _build_valid_brackets(rng, depth + 1, max_depth)
    return open_b + inner + close_b + suffix


def _corrupt_valid_brackets(rng: random.Random, s: str) -> str:
    """Corrupt a valid bracket string to make it invalid."""
    if not s:
        return rng.choice(')]}')
    lst = list(s)
    idx = rng.randrange(len(lst))
    lst[idx] = rng.choice(')]}')   # replace any char with a close bracket
    return ''.join(lst)


class TestFishStack(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_empty(self):
        self.assertTrue(is_valid_boxes(""))

    def test_edge_single_open(self):
        for ch in '([{':
            self.assertFalse(is_valid_boxes(ch))

    def test_edge_single_close(self):
        for ch in ')]}':
            self.assertFalse(is_valid_boxes(ch))

    # ── property: generated valid strings ────────────────────────────────────
    def test_property_valid_brackets(self):
        rng = random.Random(42)
        for _ in range(30):
            s = _build_valid_brackets(rng)
            expected = _reference_is_valid_boxes(s)
            self.assertEqual(
                is_valid_boxes(s), expected,
                msg=f"Expected is_valid_boxes({s!r}) == {expected}",
            )

    # ── property: corrupted strings are invalid ───────────────────────────────
    def test_property_corrupted_brackets(self):
        rng = random.Random(77)
        for _ in range(20):
            valid = _build_valid_brackets(rng)
            corrupted = _corrupt_valid_brackets(rng, valid)
            expected = _reference_is_valid_boxes(corrupted)
            self.assertEqual(
                is_valid_boxes(corrupted), expected,
                msg=f"Mismatch on corrupted {corrupted!r}: expected {expected}",
            )

    # ── property: random bracket strings against reference ───────────────────
    def test_property_random_brackets(self):
        rng = random.Random(13)
        all_brackets = '()[]{}()[]'   # weighted towards common brackets
        for _ in range(30):
            length = rng.randint(1, 20)
            s = ''.join(rng.choice(all_brackets) for _ in range(length))
            expected = _reference_is_valid_boxes(s)
            self.assertEqual(
                is_valid_boxes(s), expected,
                msg=f"Mismatch on random {s!r}: expected {expected}",
            )


if __name__ == '__main__':
    unittest.main()
