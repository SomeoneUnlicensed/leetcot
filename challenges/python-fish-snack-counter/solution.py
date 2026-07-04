def count_snacks(snacks):
    result = {}
    for snack in snacks:
        result[snack] = result.get(snack, 0) + 1
    return result
