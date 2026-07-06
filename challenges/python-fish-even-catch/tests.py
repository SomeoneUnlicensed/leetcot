# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "count_even_fish"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"count_even_fish","referenceSolution":"def count_even_fish(numbers):\n    return sum(1 for number in numbers if number % 2 == 0)\n","seedGenerator":"import random\n\n\ndef generate_case():\n    size = random.randint(0, 60)\n    return ([random.randint(-100, 100) for _ in range(size)],)\n"}
