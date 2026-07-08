def count_ration_plans(bowls, target):
    ways = {0: 1}
    for value in bowls:
        updated = ways.copy()
        for total, count in ways.items():
            updated[total + value] = updated.get(total + value, 0) + count
        ways = updated
    return ways.get(target, 0)
