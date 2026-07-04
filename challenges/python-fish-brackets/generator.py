import random


def generate_case():
    chars = '()[]{}'
    size = random.randint(0, 40)
    return (''.join(random.choice(chars) for _ in range(size)),)
