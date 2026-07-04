import random


def generate_case():
    size = random.randint(0, 40)
    bowls = [random.choice([0, random.randint(-20, 20)]) for _ in range(size)]
    return (bowls,)
