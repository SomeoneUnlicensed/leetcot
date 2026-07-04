import random


def generate_case():
    size = random.randint(0, 70)
    values = [random.randint(0, 5) for _ in range(size)]
    return (values,)
