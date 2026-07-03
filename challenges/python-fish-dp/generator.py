import random


def generate_case():
    n = random.randint(0, 15)
    sausages = [random.randint(0, 100) for _ in range(n)]
    return (sausages,)
