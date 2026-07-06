# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "longest_laser_track"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"longest_laser_track","referenceSolution":"def longest_laser_track(s):\r\n    charSet = set()\r\n    l = 0\r\n    res = 0\r\n    for r in range(len(s)):\r\n        while s[r] in charSet:\r\n            charSet.remove(s[l])\r\n            l += 1\r\n        charSet.add(s[r])\r\n        res = max(res, r - l + 1)\r\n    return res\r\n","seedGenerator":"import random\n\nalphabet = 'ab cde'\n\n\ndef generate_case():\n    length = random.randint(0, 20)\n    s = ''.join(random.choice(alphabet) for _ in range(length))\n    return (s,)\n"}
