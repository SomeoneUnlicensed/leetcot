import random


def generate_case():
    size = random.randint(0, 45)
    steps = [random.randint(-3, 3) for _ in range(size)]
    return (steps,)
