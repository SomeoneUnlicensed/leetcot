# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "find_sausage"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"find_sausage","referenceSolution":"def find_sausage(containers, target):\r\n    left, right = 0, len(containers) - 1\r\n    while left <= right:\r\n        mid = (left + right) // 2\r\n        if containers[mid] == target:\r\n            return mid\r\n        elif containers[mid] < target:\r\n            left = mid + 1\r\n        else:\r\n            right = mid - 1\r\n    return -1\r\n","seedGenerator":"import random\n\n\ndef generate_case():\n    size = random.randint(0, 20)\n    arr = sorted(set(random.randint(-200, 200) for _ in range(size)))\n    if arr and random.random() < 0.6:\n        target = random.choice(arr)\n    else:\n        target = random.randint(-250, 250)\n    return (arr, target)\n"}
