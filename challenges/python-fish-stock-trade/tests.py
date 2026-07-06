# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "max_profit"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"max_profit","referenceSolution":"def max_profit(prices):\r\n    if not prices:\r\n        return 0\r\n    min_price = float('inf')\r\n    max_prof = 0\r\n    for price in prices:\r\n        if price < min_price:\r\n            min_price = price\r\n        elif price - min_price > max_prof:\r\n            max_prof = price - min_price\r\n    return max_prof\r\n","seedGenerator":"import random\n\n\ndef generate_case():\n    n = random.randint(0, 15)\n    prices = [random.randint(1, 200) for _ in range(n)]\n    return (prices,)\n"}
