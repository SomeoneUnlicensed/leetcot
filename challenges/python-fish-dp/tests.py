# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "max_sausages"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"max_sausages","referenceSolution":"def max_sausages(sausages):\r\n    if not sausages: return 0\r\n    if len(sausages) <= 2: return max(sausages)\r\n    \r\n    prev2, prev1 = 0, 0\r\n    for x in sausages:\r\n        prev2, prev1 = prev1, max(prev1, prev2 + x)\r\n    return prev1\r\n","seedGenerator":"import random\n\n\ndef generate_case():\n    n = random.randint(0, 15)\n    sausages = [random.randint(0, 100) for _ in range(n)]\n    return (sausages,)\n"}
