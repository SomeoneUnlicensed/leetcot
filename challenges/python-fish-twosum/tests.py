# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "two_fish"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"two_fish","referenceSolution":"def two_fish(weights, target):\r\n    prevMap = {} # val : index\r\n    for i, n in enumerate(weights):\r\n        diff = target - n\r\n        if diff in prevMap:\r\n            return [prevMap[diff], i]\r\n        prevMap[n] = i\r\n    return []\r\n","seedGenerator":"import random\n\n\ndef _count_pairs_summing_to(weights, target):\n    count = 0\n    for a in range(len(weights)):\n        for b in range(a + 1, len(weights)):\n            if weights[a] + weights[b] == target:\n                count += 1\n    return count\n\n\ndef generate_case():\n    # The prompt guarantees exactly one valid pair — keep regenerating until that\n    # invariant actually holds instead of trusting it by construction.\n    while True:\n        n = random.randint(2, 10)\n        weights = [random.randint(-30, 30) for _ in range(n)]\n        i, j = random.sample(range(n), 2)\n        target = weights[i] + weights[j]\n        if _count_pairs_summing_to(weights, target) == 1:\n            return (weights, target)\n","resultOrderInsensitive":true}
