import unittest

class TestFishHeap(unittest.TestCase):
    def test_queue(self):
        q = FeedingQueue()
        q.add_cat(5)
        q.add_cat(10)
        q.add_cat(3)
        self.assertEqual(q.feed_next(), 10)
        self.assertEqual(q.feed_next(), 5)
        self.assertEqual(q.feed_next(), 3)
        self.assertIsNone(q.feed_next())

if __name__ == '__main__':
    unittest.main()
