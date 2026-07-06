# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "max_depth"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"max_depth","referenceSolution":"def max_depth(root):\r\n    if not root:\r\n        return 0\r\n    return 1 + max(max_depth(root.left), max_depth(root.right))\r\n","seedGenerator":"import random\n\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef build(depth=0):\n    if depth > 6 or random.random() < 0.25:\n        return None\n    return TreeNode(random.randint(-20, 20), build(depth + 1), build(depth + 1))\n\ndef generate_case():\n    return (build(),)\n"}
