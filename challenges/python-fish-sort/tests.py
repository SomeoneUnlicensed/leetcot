# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "sort_fish"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"sort_fish","referenceSolution":"def sort_fish(fish_weights):\r\n    return sorted(fish_weights, reverse=True)\r\n","seedGenerator":"import random\n\n\ndef generate_case():\n    n = random.randint(0, 15)\n    weights = [random.randint(-100, 100) for _ in range(n)]\n    return (weights,)\n"}
