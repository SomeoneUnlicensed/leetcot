# Видимый smoke-тест. Скрытая проверка ниже использует банк закрытых тестов и скрыта от клиента.
import sys

ENTRY_POINT = "count_ration_plans"
if globals().get(ENTRY_POINT) is None:
    print(f"Функция или класс {ENTRY_POINT} не найдены", file=sys.stderr)
    sys.exit(1)

print("visible smoke OK")

# ---LEETCOT-HIDDEN-TESTS---
# {"entryPoint":"count_ration_plans","cases":[{"name":"Тест 1","args":[[],0],"expected":1},{"name":"Тест 2","args":[[],5],"expected":0},{"name":"Тест 3","args":[[2,3,5,5],10],"expected":3},{"name":"Тест 4","args":[[1,1,1,1],2],"expected":6},{"name":"Тест 5","args":[[4,6,10,3,7],10],"expected":3},{"name":"Тест 6","args":[[0,0,1],1],"expected":4},{"name":"Тест 7","args":[[5,5,5,5,5],15],"expected":10},{"name":"Тест 8","args":[[2,4,6,8,10,12],14],"expected":4}]}
