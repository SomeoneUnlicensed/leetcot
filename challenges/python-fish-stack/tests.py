# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "is_valid_boxes"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"is_valid_boxes","referenceSolution":"def is_valid_boxes(s):\r\n    stack = []\r\n    mapping = {\")\": \"(\", \"}\": \"{\", \"]\": \"[\"}\r\n    for char in s:\r\n        if char in mapping:\r\n            top_element = stack.pop() if stack else '#'\r\n            if mapping[char] != top_element:\r\n                return False\r\n        else:\r\n            stack.append(char)\r\n    return not stack\r\n","seedGenerator":"import random\n\npairs = [('(', ')'), ('{', '}'), ('[', ']')]\n\n\ndef _generate_valid(depth):\n    if depth <= 0 or random.random() < 0.3:\n        return ''\n    opener, closer = random.choice(pairs)\n    return opener + _generate_valid(depth - 1) + closer + _generate_valid(depth - 1)\n\n\ndef generate_case():\n    if random.random() < 0.5:\n        s = _generate_valid(random.randint(0, 4))\n        # Occasionally splice two valid chunks together (still valid).\n        if random.random() < 0.5:\n            s += _generate_valid(random.randint(0, 3))\n    else:\n        # Random bracket soup — usually invalid, occasionally valid by chance.\n        length = random.randint(0, 10)\n        chars = [c for pair in pairs for c in pair]\n        s = ''.join(random.choice(chars) for _ in range(length))\n    return (s,)\n"}
