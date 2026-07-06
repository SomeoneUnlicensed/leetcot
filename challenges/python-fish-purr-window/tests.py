# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "longest_purr"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"longest_purr","referenceSolution":"def longest_purr(s):\n    last_seen = {}\n    left = 0\n    best = 0\n    for right, char in enumerate(s):\n        if char in last_seen and last_seen[char] >= left:\n            left = last_seen[char] + 1\n        last_seen[char] = right\n        best = max(best, right - left + 1)\n    return best\n","seedGenerator":"import random\nimport string\n\n\ndef generate_case():\n    alphabet = string.ascii_lowercase[: random.randint(1, 10)]\n    size = random.randint(0, 60)\n    s = ''.join(random.choice(alphabet) for _ in range(size))\n    return (s,)\n"}
