def compact_bowls(bowls):
    non_empty = [item for item in bowls if item != 0]
    return non_empty + [0] * (len(bowls) - len(non_empty))
