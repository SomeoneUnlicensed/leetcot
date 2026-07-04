import random


def generate_case():
    rows = random.randint(0, 7)
    cols = random.randint(0, 7)
    if rows == 0 or cols == 0:
        return ([],)
    grid = [[1 if random.random() < 0.3 else 0 for _ in range(cols)] for _ in range(rows)]
    return (grid,)
