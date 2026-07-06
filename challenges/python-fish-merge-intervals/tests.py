# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "merge_intervals"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"merge_intervals","referenceSolution":"def merge_intervals(intervals):\r\n    if not intervals:\r\n        return []\r\n    intervals.sort(key=lambda x: x[0])\r\n    merged = []\r\n    for interval in intervals:\r\n        if not merged or merged[-1][1] < interval[0]:\r\n            merged.append(interval)\r\n        else:\r\n            merged[-1][1] = max(merged[-1][1], interval[1])\r\n    return merged\r\n","seedGenerator":"import random\n\n\ndef generate_case():\n    n = random.randint(0, 8)\n    intervals = []\n    for _ in range(n):\n        start = random.randint(0, 30)\n        length = random.randint(0, 10)\n        intervals.append([start, start + length])\n    return (intervals,)\n"}
