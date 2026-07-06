# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "toy_permutations"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"toy_permutations","referenceSolution":"def toy_permutations(toys):\n    res = []\n\n    if len(toys) == 0:\n        return [[]]\n\n    if len(toys) == 1:\n        return [toys[:]]\n\n    for i in range(len(toys)):\n        n = toys.pop(0)\n        perms = toy_permutations(toys)\n\n        for p in perms:\n            p.append(n)\n        res.extend(perms)\n        toys.append(n)\n\n    return res\n","seedGenerator":"import random\n\ndef generate_case():\n    size = random.randint(0, 6)\n    return (list(range(size)),)\n"}
