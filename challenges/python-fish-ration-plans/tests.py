# Видимый smoke-тест. Скрытая проверка ниже использует банк закрытых тестов и скрыта от клиента.
import sys

ENTRY_POINT = "count_ration_plans"
if globals().get(ENTRY_POINT) is None:
    print(f"Функция или класс {ENTRY_POINT} не найдены", file=sys.stderr)
    sys.exit(1)

print("visible smoke OK")

# ---LEETCOT-HIDDEN-TESTS---
# {"entryPoint":"count_ration_plans","seedGenerator":"import random\n\n\ndef generate_case():\n    size = random.randint(0, 16)\n    bowls = [random.randint(0, 12) for _ in range(size)]\n    target = random.randint(0, 30)\n    return (bowls, target)\n","cases":[{"name":"Test 1","seed":1,"expected":0},{"name":"Test 2","seed":2,"expected":0},{"name":"Test 3","seed":3,"expected":4},{"name":"Test 4","seed":4,"expected":2},{"name":"Test 5","seed":5,"expected":6},{"name":"Test 6","seed":6,"expected":0},{"name":"Test 7","seed":7,"expected":24},{"name":"Test 8","seed":8,"expected":2},{"name":"Test 9","seed":9,"expected":438},{"name":"Test 10","seed":10,"expected":0},{"name":"Test 11","seed":11,"expected":1},{"name":"Test 12","seed":12,"expected":264},{"name":"Test 13","seed":13,"expected":1},{"name":"Test 14","seed":14,"expected":1},{"name":"Test 15","seed":15,"expected":4},{"name":"Test 16","seed":16,"expected":10},{"name":"Test 17","seed":17,"expected":524},{"name":"Test 18","seed":18,"expected":1},{"name":"Test 19","seed":19,"expected":0},{"name":"Test 20","seed":20,"expected":0},{"name":"Test 21","seed":21,"expected":1},{"name":"Test 22","seed":22,"expected":0},{"name":"Test 23","seed":23,"expected":22},{"name":"Test 24","seed":24,"expected":101},{"name":"Test 25","seed":25,"expected":32},{"name":"Test 26","seed":26,"expected":0},{"name":"Test 27","seed":27,"expected":313},{"name":"Test 28","seed":28,"expected":1},{"name":"Test 29","seed":29,"expected":0},{"name":"Test 30","seed":30,"expected":8},{"name":"Test 31","seed":31,"expected":0},{"name":"Test 32","seed":32,"expected":0},{"name":"Test 33","seed":33,"expected":0},{"name":"Test 34","seed":34,"expected":124},{"name":"Test 35","seed":35,"expected":34},{"name":"Test 36","seed":36,"expected":8},{"name":"Test 37","seed":37,"expected":0},{"name":"Test 38","seed":38,"expected":78},{"name":"Test 39","seed":39,"expected":0},{"name":"Test 40","seed":40,"expected":40}]}
