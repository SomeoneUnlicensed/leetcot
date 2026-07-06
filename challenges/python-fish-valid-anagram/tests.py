# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "is_anagram"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"is_anagram","referenceSolution":"def is_anagram(s, t):\r\n    if len(s) != len(t):\r\n        return False\r\n    count = {}\r\n    for char in s:\r\n        count[char] = count.get(char, 0) + 1\r\n    for char in t:\r\n        if char not in count:\r\n            return False\r\n        count[char] -= 1\r\n        if count[char] < 0:\r\n            return False\r\n    return True\r\n","seedGenerator":"import random\n\nletters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'\n\n\ndef generate_case():\n    length = random.randint(0, 12)\n    s = ''.join(random.choice(letters) for _ in range(length))\n    if random.random() < 0.5:\n        # A genuine anagram: shuffle the same letters.\n        t = list(s)\n        random.shuffle(t)\n        t = ''.join(t)\n    else:\n        # Not necessarily an anagram — random string, same length distribution.\n        t_length = length if random.random() < 0.7 else random.randint(0, 12)\n        t = ''.join(random.choice(letters) for _ in range(t_length))\n    return (s, t)\n"}
