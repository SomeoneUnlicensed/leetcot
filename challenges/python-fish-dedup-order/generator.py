import random


def generate_case():
    pool = ['fish', 'milk', 'yarn', 'box', 'nap']
    size = random.randint(0, 50)
    return ([random.choice(pool) for _ in range(size)],)
