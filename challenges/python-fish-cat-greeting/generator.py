import random
import string


def generate_case():
    length = random.randint(2, 10)
    name = ''.join(random.choices(string.ascii_lowercase, k=length))
    return (name.capitalize(),)
