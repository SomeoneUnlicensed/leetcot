import unittest

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TestFishYarn(unittest.TestCase):
    def test_reverse(self):
        head = ListNode(1, ListNode(2, ListNode(3)))
        new_head = reverse_yarn(head)
        self.assertEqual(new_head.val, 3)
        self.assertEqual(new_head.next.val, 2)
        self.assertEqual(new_head.next.next.val, 1)
        
    def test_empty(self):
        self.assertIsNone(reverse_yarn(None))

if __name__ == '__main__':
    unittest.main()
