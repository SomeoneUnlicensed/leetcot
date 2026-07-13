import random
import string


def generate_case():
    length = random.randint(1, 5)
    text = ''.join(random.choices(string.ascii_lowercase, k=length))
    n = random.randint(0, 10)
    return (text, n)
