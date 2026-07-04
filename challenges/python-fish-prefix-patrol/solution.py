def count_balanced_walks(steps):
    seen = {0: 1}
    current = 0
    total = 0
    for step in steps:
        current += step
        total += seen.get(current, 0)
        seen[current] = seen.get(current, 0) + 1
    return total
