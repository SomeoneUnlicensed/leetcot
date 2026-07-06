# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "best_scores"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"best_scores","referenceSolution":"def best_scores(attempts):\n    result = {}\n    for name, score in attempts:\n        if name not in result or score > result[name]:\n            result[name] = score\n    return result\n","seedGenerator":"import random\n\n\ndef generate_case():\n    names = ['Mira', 'Bars', 'Keks', 'Luna', 'Pixel']\n    size = random.randint(0, 40)\n    attempts = [(random.choice(names), random.randint(-10, 100)) for _ in range(size)]\n    return (attempts,)\n"}
