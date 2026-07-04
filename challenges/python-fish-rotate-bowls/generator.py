import random


def generate_case():
    size = random.randint(0, 30)
    bowls = [random.randint(-50, 50) for _ in range(size)]
    k = random.randint(0, 120)
    return (bowls, k)
