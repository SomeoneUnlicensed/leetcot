import unittest
import random


def _reference_max_profit(prices: list) -> int:
    """Best time to buy and sell stock (single transaction)."""
    if not prices:
        return 0
    min_price = float('inf')
    best = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > best:
            best = p - min_price
    return best


class TestStockTrade(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_empty(self):
        self.assertEqual(max_profit([]), 0)

    def test_edge_single_price(self):
        rng = random.Random(5)
        for _ in range(10):
            p = rng.randint(1, 1000)
            self.assertEqual(max_profit([p]), 0,
                             msg=f"Single price [{p}] cannot yield profit")

    def test_edge_monotone_decreasing(self):
        rng = random.Random(6)
        for _ in range(10):
            start = rng.randint(10, 200)
            count = rng.randint(2, 10)
            prices = sorted([rng.randint(1, start) for _ in range(count)], reverse=True)
            self.assertEqual(max_profit(prices), 0,
                             msg=f"Decreasing prices {prices} should yield 0")

    def test_edge_all_equal(self):
        rng = random.Random(7)
        for _ in range(10):
            v = rng.randint(1, 100)
            count = rng.randint(2, 10)
            self.assertEqual(max_profit([v] * count), 0,
                             msg=f"All equal prices [{v}x{count}] should yield 0")

    # ── property: random arrays vs reference ─────────────────────────────────
    def test_property_random_arrays(self):
        rng = random.Random(42)
        for _ in range(40):
            count = rng.randint(1, 30)
            prices = [rng.randint(1, 300) for _ in range(count)]
            expected = _reference_max_profit(prices)
            self.assertEqual(
                max_profit(prices), expected,
                msg=f"Mismatch on {prices}: expected {expected}",
            )

    # ── property: profit is always non-negative ───────────────────────────────
    def test_property_non_negative_profit(self):
        rng = random.Random(77)
        for _ in range(20):
            count = rng.randint(1, 20)
            prices = [rng.randint(1, 100) for _ in range(count)]
            self.assertGreaterEqual(max_profit(prices), 0,
                                    msg=f"Profit should never be negative for {prices}")

    # ── property: profit never exceeds max - min ─────────────────────────────
    def test_property_bounded_by_range(self):
        rng = random.Random(13)
        for _ in range(20):
            count = rng.randint(2, 20)
            prices = [rng.randint(1, 200) for _ in range(count)]
            result = max_profit(prices)
            upper_bound = max(prices) - min(prices)
            self.assertLessEqual(
                result, upper_bound,
                msg=f"Profit {result} exceeds max-min={upper_bound} for {prices}",
            )


if __name__ == '__main__':
    unittest.main()
