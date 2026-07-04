def rotate_bowls(bowls, k):
    if not bowls:
        return []
    shift = k % len(bowls)
    if shift == 0:
        return list(bowls)
    return list(bowls[-shift:]) + list(bowls[:-shift])
