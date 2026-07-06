# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "unique_in_order"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"unique_in_order","referenceSolution":"def unique_in_order(items):\n    seen = set()\n    result = []\n    for item in items:\n        if item not in seen:\n            seen.add(item)\n            result.append(item)\n    return result\n","seedGenerator":"import random\n\n\ndef generate_case():\n    pool = ['fish', 'milk', 'yarn', 'box', 'nap']\n    size = random.randint(0, 50)\n    return ([random.choice(pool) for _ in range(size)],)\n"}
