def two_fish(weights, target):
    prevMap = {} # val : index
    for i, n in enumerate(weights):
        diff = target - n
        if diff in prevMap:
            return [prevMap[diff], i]
        prevMap[n] = i
    return []
