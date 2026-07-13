import random
import string


def generate_case():
    length = random.randint(1, 15)
    text = ''.join(random.choices(string.ascii_letters + string.digits + " ", k=length))
    return (text,)
