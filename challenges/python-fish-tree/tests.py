import random
import unittest


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def _reference_max_depth(root):
    """Эталонное решение для проверки — не доступно пользователю."""
    if root is None:
        return 0
    return 1 + max(_reference_max_depth(root.left), _reference_max_depth(root.right))


def _build_tree(nodes):
    """Строит дерево из списка значений (BFS-порядок, None = пустой узел)."""
    if not nodes:
        return None
    root = TreeNode(nodes[0])
    queue = [root]
    i = 1
    while queue and i < len(nodes):
        node = queue.pop(0)
        if i < len(nodes) and nodes[i] is not None:
            node.left = TreeNode(nodes[i])
            queue.append(node.left)
        i += 1
        if i < len(nodes) and nodes[i] is not None:
            node.right = TreeNode(nodes[i])
            queue.append(node.right)
        i += 1
    return root


class TestFishTree(unittest.TestCase):
    def test_empty(self):
        """Пустое дерево → глубина 0."""
        self.assertEqual(max_depth(None), 0)

    def test_single_node(self):
        """Одиночный узел → глубина 1."""
        rng = random.Random(101)
        for _ in range(5):
            val = rng.randint(1, 999)
            self.assertEqual(max_depth(TreeNode(val)), 1)

    def test_known_cases(self):
        """Фиксированные деревья — проверяем корректность базовой логики."""
        cases = [
            ([3, 9, 20, None, None, 15, 7], 3),
            ([1, None, 2], 2),
            ([1, 2, 3, 4, 5], 3),
        ]
        for nodes, expected in cases:
            root = _build_tree(nodes)
            self.assertEqual(max_depth(root), expected)

    def test_random_trees(self):
        """Случайные деревья — результат сверяется с эталонным решением."""
        rng = random.Random(31415)
        for _ in range(30):
            size = rng.randint(1, 31)
            vals = [rng.randint(1, 100) if rng.random() > 0.15 else None for _ in range(size)]
            vals[0] = rng.randint(1, 100)  # корень всегда не None
            root = _build_tree(vals)
            expected = _reference_max_depth(root)
            self.assertEqual(
                max_depth(root),
                expected,
                msg=f"Дерево {vals}: ожидали глубину {expected}",
            )

    def test_linear_chains(self):
        """Цепочки (только левые / только правые дети)."""
        rng = random.Random(27182)
        for depth in range(1, 11):
            # только левые дети
            root = None
            for _ in range(depth):
                node = TreeNode(rng.randint(1, 100))
                node.left = root
                root = node
            self.assertEqual(max_depth(root), depth)


if __name__ == '__main__':
    unittest.main()
