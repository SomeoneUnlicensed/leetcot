import random


def generate_case():
    size = random.randint(1, 15)
    return ([random.randint(-100, 100) for _ in range(size)],)
