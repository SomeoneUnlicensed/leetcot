import random


def generate_case():
    n = random.randint(0, 8)
    intervals = []
    for _ in range(n):
        start = random.randint(0, 30)
        length = random.randint(0, 10)
        intervals.append([start, start + length])
    return (intervals,)
