# Видимый smoke-тест. Скрытая проверка ниже использует банк закрытых тестов и скрыта от клиента.
import sys

ENTRY_POINT = "min_tuna_crates"
if globals().get(ENTRY_POINT) is None:
    print(f"Функция или класс {ENTRY_POINT} не найдены", file=sys.stderr)
    sys.exit(1)

print("visible smoke OK")

# ---LEETCOT-HIDDEN-TESTS---
# {"entryPoint":"min_tuna_crates","cases":[{"name":"Тест 1","args":[[],10],"expected":0},{"name":"Тест 2","args":[[4,8,1,4,2,1],10],"expected":2},{"name":"Тест 3","args":[[5,5,5,5],10],"expected":2},{"name":"Тест 4","args":[[6,6,6],10],"expected":3},{"name":"Тест 5","args":[[2,3,4,5,6],8],"expected":3},{"name":"Тест 6","args":[[9,1,8,2,7,3],10],"expected":3},{"name":"Тест 7","args":[[1,1,1,1,1,1,1],3],"expected":3},{"name":"Тест 8","args":[[10,9,8,2,1,1],10],"expected":4}]}
