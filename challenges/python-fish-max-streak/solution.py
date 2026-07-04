def longest_streak(items):
    if not items:
        return 0
    best = 1
    current = 1
    for index in range(1, len(items)):
        if items[index] == items[index - 1]:
            current += 1
        else:
            current = 1
        best = max(best, current)
    return best
