import random


def generate_case():
    size = random.randint(0, 20)
    arr = sorted(set(random.randint(-200, 200) for _ in range(size)))
    if arr and random.random() < 0.6:
        target = random.choice(arr)
    else:
        target = random.randint(-250, 250)
    return (arr, target)
