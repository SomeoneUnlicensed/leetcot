import unittest
import random


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def _list_to_python(head) -> list:
    result = []
    node = head
    while node:
        result.append(node.val)
        node = node.next
    return result


def _python_to_list(values: list):
    if not values:
        return None
    head = ListNode(values[0])
    cur = head
    for v in values[1:]:
        cur.next = ListNode(v)
        cur = cur.next
    return head


def _reference_reverse_yarn(head):
    """Iteratively reverse a linked list."""
    prev = None
    cur = head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev


class TestFishYarn(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_empty(self):
        self.assertIsNone(reverse_yarn(None))

    def test_edge_single(self):
        rng = random.Random(5)
        for _ in range(10):
            v = rng.randint(0, 200)
            head = ListNode(v)
            result = reverse_yarn(head)
            self.assertIsNotNone(result)
            self.assertEqual(result.val, v)
            self.assertIsNone(result.next)

    def test_edge_two_nodes(self):
        rng = random.Random(6)
        for _ in range(10):
            a, b = rng.randint(0, 100), rng.randint(0, 100)
            head = _python_to_list([a, b])
            result = reverse_yarn(head)
            self.assertEqual(_list_to_python(result), [b, a],
                             msg=f"Reversing [{a}, {b}] should give [{b}, {a}]")

    # ── property: reversed list matches reference ─────────────────────────────
    def test_property_matches_reference(self):
        rng = random.Random(42)
        for _ in range(30):
            length = rng.randint(1, 20)
            values = [rng.randint(0, 500) for _ in range(length)]
            head = _python_to_list(values)
            result = reverse_yarn(head)
            expected = list(reversed(values))
            self.assertEqual(
                _list_to_python(result), expected,
                msg=f"Reversing {values} should give {expected}",
            )

    # ── property: reversing twice gives original ──────────────────────────────
    def test_property_double_reverse_is_identity(self):
        rng = random.Random(77)
        for _ in range(20):
            length = rng.randint(1, 15)
            values = [rng.randint(0, 300) for _ in range(length)]
            head = _python_to_list(values)
            once = reverse_yarn(head)
            twice = reverse_yarn(once)
            self.assertEqual(
                _list_to_python(twice), values,
                msg=f"Double reverse of {values} should restore original",
            )

    # ── property: length is preserved ────────────────────────────────────────
    def test_property_length_preserved(self):
        rng = random.Random(13)
        for _ in range(20):
            length = rng.randint(1, 20)
            values = [rng.randint(0, 100) for _ in range(length)]
            head = _python_to_list(values)
            result = reverse_yarn(head)
            self.assertEqual(
                len(_list_to_python(result)), length,
                msg=f"Reversing {values} should preserve length {length}",
            )

    # ── property: same elements (multiset) preserved ─────────────────────────
    def test_property_elements_preserved(self):
        rng = random.Random(99)
        for _ in range(20):
            length = rng.randint(1, 20)
            values = [rng.randint(0, 100) for _ in range(length)]
            head = _python_to_list(values)
            result = reverse_yarn(head)
            self.assertEqual(
                sorted(_list_to_python(result)), sorted(values),
                msg=f"Elements should be preserved when reversing {values}",
            )


if __name__ == '__main__':
    unittest.main()
