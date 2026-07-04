import random


def generate_case():
    names = ['fish', 'milk', 'yarn', 'shrimp', 'tuna', 'cream']
    size = random.randint(0, 50)
    snacks = [random.choice(names) for _ in range(size)]
    return (snacks,)
