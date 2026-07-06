import random

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build(depth=0):
    if depth > 6 or random.random() < 0.25:
        return None
    return TreeNode(random.randint(-20, 20), build(depth + 1), build(depth + 1))

def generate_case():
    return (build(),)
