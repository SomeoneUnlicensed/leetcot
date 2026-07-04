import random


def generate_case():
    names = ['fish', 'milk', 'tea', 'shrimp', 'tuna', 'cream']
    size = random.randint(0, 70)
    snacks = [random.choice(names) for _ in range(size)]
    k = random.randint(0, len(names))
    return (snacks, k)
