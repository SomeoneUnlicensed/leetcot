import random


def generate_case():
    size = random.randint(0, 10)
    limit = random.randint(3, 15)
    weights = [random.randint(1, limit) for _ in range(size)]
    return (weights, limit)
