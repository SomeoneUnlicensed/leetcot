# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "reverse_yarn"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"reverse_yarn","referenceSolution":"def reverse_yarn(head):\r\n    prev, curr = None, head\r\n    while curr:\r\n        nxt = curr.next\r\n        curr.next = prev\r\n        prev = curr\r\n        curr = nxt\r\n    return prev\r\n","seedGenerator":"import random\n\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef make_list(values):\n    head = None\n    for value in reversed(values):\n        head = ListNode(value, head)\n    return head\n\ndef generate_case():\n    size = random.randint(0, 25)\n    values = [random.randint(-30, 30) for _ in range(size)]\n    return (make_list(values),)\n"}
