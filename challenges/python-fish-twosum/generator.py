import random


def _count_pairs_summing_to(weights, target):
    count = 0
    for a in range(len(weights)):
        for b in range(a + 1, len(weights)):
            if weights[a] + weights[b] == target:
                count += 1
    return count


def generate_case():
    # The prompt guarantees exactly one valid pair — keep regenerating until that
    # invariant actually holds instead of trusting it by construction.
    while True:
        n = random.randint(2, 10)
        weights = [random.randint(-30, 30) for _ in range(n)]
        i, j = random.sample(range(n), 2)
        target = weights[i] + weights[j]
        if _count_pairs_summing_to(weights, target) == 1:
            return (weights, target)
