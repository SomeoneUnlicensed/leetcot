import random


def generate_case():
    n = random.randint(0, 15)
    prices = [random.randint(1, 200) for _ in range(n)]
    return (prices,)
