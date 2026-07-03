import random


def generate_case():
    n = random.randint(0, 15)
    weights = [random.randint(-100, 100) for _ in range(n)]
    return (weights,)
