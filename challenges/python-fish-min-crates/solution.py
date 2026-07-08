def min_tuna_crates(weights, limit):
    n = len(weights)
    if n == 0:
        return 0

    best = [(n + 1, 0)] * (1 << n)
    best[0] = (1, 0)

    for mask in range(1 << n):
        crates, used = best[mask]
        for i, weight in enumerate(weights):
            if mask & (1 << i):
                continue
            if used + weight <= limit:
                candidate = (crates, used + weight)
            else:
                candidate = (crates + 1, weight)

            next_mask = mask | (1 << i)
            if candidate < best[next_mask]:
                best[next_mask] = candidate

    return best[(1 << n) - 1][0]
