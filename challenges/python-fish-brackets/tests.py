# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "is_valid_brackets"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"is_valid_brackets","referenceSolution":"def is_valid_brackets(s):\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for char in s:\n        if char in '([{':\n            stack.append(char)\n        elif not stack or stack.pop() != pairs[char]:\n            return False\n    return not stack\n","seedGenerator":"import random\n\n\ndef generate_case():\n    chars = '()[]{}'\n    size = random.randint(0, 40)\n    return (''.join(random.choice(chars) for _ in range(size)),)\n"}
