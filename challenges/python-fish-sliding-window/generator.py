import random

alphabet = 'ab cde'


def generate_case():
    length = random.randint(0, 20)
    s = ''.join(random.choice(alphabet) for _ in range(length))
    return (s,)
