import random


def generate_case():
    values = sorted(random.sample(range(-30, 40), random.randint(0, 25)))
    return (values,)
