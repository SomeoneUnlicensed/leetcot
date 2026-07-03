import random

pairs = [('(', ')'), ('{', '}'), ('[', ']')]


def _generate_valid(depth):
    if depth <= 0 or random.random() < 0.3:
        return ''
    opener, closer = random.choice(pairs)
    return opener + _generate_valid(depth - 1) + closer + _generate_valid(depth - 1)


def generate_case():
    if random.random() < 0.5:
        s = _generate_valid(random.randint(0, 4))
        # Occasionally splice two valid chunks together (still valid).
        if random.random() < 0.5:
            s += _generate_valid(random.randint(0, 3))
    else:
        # Random bracket soup — usually invalid, occasionally valid by chance.
        length = random.randint(0, 10)
        chars = [c for pair in pairs for c in pair]
        s = ''.join(random.choice(chars) for _ in range(length))
    return (s,)
