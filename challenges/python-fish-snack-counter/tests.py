# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "count_snacks"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"count_snacks","referenceSolution":"def count_snacks(snacks):\n    result = {}\n    for snack in snacks:\n        result[snack] = result.get(snack, 0) + 1\n    return result\n","seedGenerator":"import random\n\n\ndef generate_case():\n    names = ['fish', 'milk', 'yarn', 'shrimp', 'tuna', 'cream']\n    size = random.randint(0, 50)\n    snacks = [random.choice(names) for _ in range(size)]\n    return (snacks,)\n"}
