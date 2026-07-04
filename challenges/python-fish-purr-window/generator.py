import random
import string


def generate_case():
    alphabet = string.ascii_lowercase[: random.randint(1, 10)]
    size = random.randint(0, 60)
    s = ''.join(random.choice(alphabet) for _ in range(size))
    return (s,)
