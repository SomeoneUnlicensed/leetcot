# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "is_palindrome_cat"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"is_palindrome_cat","referenceSolution":"def is_palindrome_cat(s):\r\n    newStr = \"\".join(char.lower() for char in s if char.isalnum())\r\n    return newStr == newStr[::-1]\r\n","seedGenerator":"import random\n\nletters = 'abcdefg'\npunctuation = [' ', ',', '.', '!', '-']\n\n\ndef _random_string(length):\n    chars = []\n    for _ in range(length):\n        c = random.choice(letters)\n        if random.random() < 0.3:\n            c = c.upper()\n        chars.append(c)\n        if random.random() < 0.2:\n            chars.append(random.choice(punctuation))\n    return ''.join(chars)\n\n\ndef generate_case():\n    length = random.randint(0, 12)\n    if random.random() < 0.5 and length > 0:\n        half = _random_string(length // 2)\n        middle = random.choice(letters) if length % 2 else ''\n        s = half + middle + half[::-1]\n    else:\n        s = _random_string(length)\n    return (s,)\n"}
