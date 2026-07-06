# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "count_balanced_walks"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"count_balanced_walks","referenceSolution":"def count_balanced_walks(steps):\n    seen = {0: 1}\n    current = 0\n    total = 0\n    for step in steps:\n        current += step\n        total += seen.get(current, 0)\n        seen[current] = seen.get(current, 0) + 1\n    return total\n","seedGenerator":"import random\n\n\ndef generate_case():\n    size = random.randint(0, 45)\n    steps = [random.randint(-3, 3) for _ in range(size)]\n    return (steps,)\n"}
