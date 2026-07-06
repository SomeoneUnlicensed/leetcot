# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "compact_bowls"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"compact_bowls","referenceSolution":"def compact_bowls(bowls):\n    non_empty = [item for item in bowls if item != 0]\n    return non_empty + [0] * (len(bowls) - len(non_empty))\n","seedGenerator":"import random\n\n\ndef generate_case():\n    size = random.randint(0, 40)\n    bowls = [random.choice([0, random.randint(-20, 20)]) for _ in range(size)]\n    return (bowls,)\n"}
