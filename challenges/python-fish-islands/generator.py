import random


def generate_case():
    rows = random.randint(0, 8)
    cols = random.randint(0, 8)
    if rows == 0 or cols == 0:
        return ([],)
    grid = [[random.randint(0, 1) for _ in range(cols)] for _ in range(rows)]
    return (grid,)
