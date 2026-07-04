def summarize_ranges(nums):
    result = []
    index = 0
    while index < len(nums):
        start = nums[index]
        while index + 1 < len(nums) and nums[index + 1] == nums[index] + 1:
            index += 1
        end = nums[index]
        result.append(str(start) if start == end else f"{start}->{end}")
        index += 1
    return result
