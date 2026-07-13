import random


def generate_case():
    size = random.randint(0, 30)
    return ([random.randint(-100, 100) for _ in range(size)],)
