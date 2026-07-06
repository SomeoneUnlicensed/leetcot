# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "top_snacks"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"top_snacks","referenceSolution":"def top_snacks(snacks, k):\n    counts = {}\n    for snack in snacks:\n        counts[snack] = counts.get(snack, 0) + 1\n    ordered = sorted(counts, key=lambda item: (-counts[item], item))\n    return ordered[:k]\n","seedGenerator":"import random\n\n\ndef generate_case():\n    names = ['fish', 'milk', 'tea', 'shrimp', 'tuna', 'cream']\n    size = random.randint(0, 70)\n    snacks = [random.choice(names) for _ in range(size)]\n    k = random.randint(0, len(names))\n    return (snacks, k)\n"}
