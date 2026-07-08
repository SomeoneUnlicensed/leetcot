import random


def generate_case():
    size = random.randint(0, 16)
    bowls = [random.randint(0, 12) for _ in range(size)]
    target = random.randint(0, 30)
    return (bowls, target)
