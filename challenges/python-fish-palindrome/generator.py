import random

letters = 'abcdefg'
punctuation = [' ', ',', '.', '!', '-']


def _random_string(length):
    chars = []
    for _ in range(length):
        c = random.choice(letters)
        if random.random() < 0.3:
            c = c.upper()
        chars.append(c)
        if random.random() < 0.2:
            chars.append(random.choice(punctuation))
    return ''.join(chars)


def generate_case():
    length = random.randint(0, 12)
    if random.random() < 0.5 and length > 0:
        half = _random_string(length // 2)
        middle = random.choice(letters) if length % 2 else ''
        s = half + middle + half[::-1]
    else:
        s = _random_string(length)
    return (s,)
