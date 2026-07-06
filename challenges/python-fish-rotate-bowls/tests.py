# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "rotate_bowls"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"rotate_bowls","referenceSolution":"def rotate_bowls(bowls, k):\n    if not bowls:\n        return []\n    shift = k % len(bowls)\n    if shift == 0:\n        return list(bowls)\n    return list(bowls[-shift:]) + list(bowls[:-shift])\n","seedGenerator":"import random\n\n\ndef generate_case():\n    size = random.randint(0, 30)\n    bowls = [random.randint(-50, 50) for _ in range(size)]\n    k = random.randint(0, 120)\n    return (bowls, k)\n"}
