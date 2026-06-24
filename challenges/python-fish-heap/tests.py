import unittest
import random


class TestFishHeap(unittest.TestCase):

    # ── edge cases ──────────────────────────────────────────────────────────
    def test_edge_empty_queue(self):
        q = FeedingQueue()
        self.assertIsNone(q.feed_next())

    def test_edge_single_element(self):
        rng = random.Random(5)
        for _ in range(10):
            v = rng.randint(1, 1000)
            q = FeedingQueue()
            q.add_cat(v)
            self.assertEqual(q.feed_next(), v,
                             msg=f"Single element {v} should be returned")
            self.assertIsNone(q.feed_next(),
                              msg="Queue should be empty after one pop")

    # ── property: elements come out in descending order ──────────────────────
    def test_property_descending_order(self):
        rng = random.Random(42)
        for _ in range(30):
            count = rng.randint(1, 20)
            values = [rng.randint(1, 500) for _ in range(count)]
            q = FeedingQueue()
            for v in values:
                q.add_cat(v)
            extracted = []
            for _ in range(count):
                extracted.append(q.feed_next())
            self.assertEqual(
                extracted, sorted(values, reverse=True),
                msg=f"Values {values} should come out sorted descending",
            )

    # ── property: None returned when queue is exhausted ──────────────────────
    def test_property_none_after_exhaustion(self):
        rng = random.Random(77)
        for _ in range(20):
            count = rng.randint(1, 10)
            q = FeedingQueue()
            for _ in range(count):
                q.add_cat(rng.randint(1, 100))
            # Drain the queue
            for _ in range(count):
                q.feed_next()
            # Now it should be empty
            self.assertIsNone(q.feed_next(),
                              msg="Queue should return None when exhausted")

    # ── property: interleaved add/pop maintains max-heap invariant ───────────
    def test_property_interleaved_operations(self):
        rng = random.Random(13)
        for _ in range(20):
            q = FeedingQueue()
            reference = []   # sorted list acting as oracle
            ops = rng.randint(5, 20)
            for _ in range(ops):
                if not reference or rng.random() < 0.6:
                    v = rng.randint(1, 300)
                    q.add_cat(v)
                    reference.append(v)
                else:
                    expected = max(reference)
                    reference.remove(expected)
                    self.assertEqual(
                        q.feed_next(), expected,
                        msg=f"Expected max={expected} from queue",
                    )

    # ── property: duplicate values handled correctly ─────────────────────────
    def test_property_duplicates(self):
        rng = random.Random(55)
        for _ in range(20):
            value = rng.randint(1, 100)
            count = rng.randint(2, 10)
            q = FeedingQueue()
            for _ in range(count):
                q.add_cat(value)
            for _ in range(count):
                self.assertEqual(q.feed_next(), value,
                                 msg=f"All {count} duplicates of {value} should come back")
            self.assertIsNone(q.feed_next())


if __name__ == '__main__':
    unittest.main()
