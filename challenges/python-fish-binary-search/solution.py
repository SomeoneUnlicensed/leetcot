def find_sausage(containers, target):
    left, right = 0, len(containers) - 1
    while left <= right:
        mid = (left + right) // 2
        if containers[mid] == target:
            return mid
        elif containers[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
