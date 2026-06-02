import unittest

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class TestFishTree(unittest.TestCase):
    def test_depth_3(self):
        root = TreeNode(3)
        root.left = TreeNode(9)
        root.right = TreeNode(20, TreeNode(15), TreeNode(7))
        self.assertEqual(max_depth(root), 3)
        
    def test_empty(self):
        self.assertEqual(max_depth(None), 0)
        
    def test_single(self):
        self.assertEqual(max_depth(TreeNode(1)), 1)

if __name__ == '__main__':
    unittest.main()
