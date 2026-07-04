import random


def generate_case():
    names = ['Mira', 'Bars', 'Keks', 'Luna', 'Pixel']
    size = random.randint(0, 40)
    attempts = [(random.choice(names), random.randint(-10, 100)) for _ in range(size)]
    return (attempts,)
