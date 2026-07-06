# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "summarize_ranges"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"summarize_ranges","referenceSolution":"def summarize_ranges(nums):\n    result = []\n    index = 0\n    while index < len(nums):\n        start = nums[index]\n        while index + 1 < len(nums) and nums[index + 1] == nums[index] + 1:\n            index += 1\n        end = nums[index]\n        result.append(str(start) if start == end else f\"{start}->{end}\")\n        index += 1\n    return result\n","seedGenerator":"import random\n\n\ndef generate_case():\n    values = sorted(random.sample(range(-30, 40), random.randint(0, 25)))\n    return (values,)\n"}
