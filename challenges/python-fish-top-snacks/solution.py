def top_snacks(snacks, k):
    counts = {}
    for snack in snacks:
        counts[snack] = counts.get(snack, 0) + 1
    ordered = sorted(counts, key=lambda item: (-counts[item], item))
    return ordered[:k]
