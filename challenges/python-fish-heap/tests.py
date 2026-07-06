# Видимый smoke-тест. Серверная проверка ниже использует oracle и скрыта от клиента.
import sys

ENTRY_POINT = "FeedingQueue"
if globals().get(ENTRY_POINT) is None:
    print(f'Функция или класс {ENTRY_POINT} не найдены', file=sys.stderr)
    sys.exit(1)

print('visible smoke OK')

# ---LEETCOT-ORACLE---
# {"entryPoint":"FeedingQueue","referenceSolution":"import heapq\r\n\r\nclass FeedingQueue:\r\n    def __init__(self):\r\n        self.heap = []\r\n        \r\n    def add_cat(self, hunger_level):\r\n        heapq.heappush(self.heap, -hunger_level)\r\n        \r\n    def feed_next(self):\r\n        if not self.heap:\r\n            return None\r\n        return -heapq.heappop(self.heap)\r\n","seedGenerator":"import random\n\ndef generate_case():\n    size = random.randint(0, 30)\n    return ([random.randint(-20, 100) for _ in range(size)],)\n"}
