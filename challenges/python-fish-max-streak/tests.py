# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "longest_streak"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"longest_streak","referenceSolution":"def longest_streak(items):\n    if not items:\n        return 0\n    best = 1\n    current = 1\n    for index in range(1, len(items)):\n        if items[index] == items[index - 1]:\n            current += 1\n        else:\n            current = 1\n        best = max(best, current)\n    return best\n","seedGenerator":"import random\n\n\ndef generate_case():\n    size = random.randint(0, 70)\n    values = [random.randint(0, 5) for _ in range(size)]\n    return (values,)\n"}
