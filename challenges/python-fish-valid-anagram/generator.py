import random

letters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'


def generate_case():
    length = random.randint(0, 12)
    s = ''.join(random.choice(letters) for _ in range(length))
    if random.random() < 0.5:
        # A genuine anagram: shuffle the same letters.
        t = list(s)
        random.shuffle(t)
        t = ''.join(t)
    else:
        # Not necessarily an anagram — random string, same length distribution.
        t_length = length if random.random() < 0.7 else random.randint(0, 12)
        t = ''.join(random.choice(letters) for _ in range(t_length))
    return (s, t)
