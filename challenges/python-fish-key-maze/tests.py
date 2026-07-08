# Видимый smoke-тест. Скрытая проверка ниже использует банк закрытых тестов и скрыта от клиента.
import sys

ENTRY_POINT = "cat_key_maze"
if globals().get(ENTRY_POINT) is None:
    print(f"Функция или класс {ENTRY_POINT} не найдены", file=sys.stderr)
    sys.exit(1)

print("visible smoke OK")

# ---LEETCOT-HIDDEN-TESTS---
# {"entryPoint":"cat_key_maze","cases":[{"name":"Тест 1","args":[["SF"]],"expected":1},{"name":"Тест 2","args":[["S.a","##A","..F"]],"expected":4},{"name":"Тест 3","args":[["SAF","a..","..."]],"expected":4},{"name":"Тест 4","args":[["S#F","..."]],"expected":4},{"name":"Тест 5","args":[["S#F","###","a.A"]],"expected":-1},{"name":"Тест 6","args":[["S.a.B","###.#","b...F"]],"expected":6},{"name":"Тест 7","args":[["S..a","##.#","b.BF"]],"expected":-1},{"name":"Тест 8","args":[["S.A","...","..F"]],"expected":4}]}
