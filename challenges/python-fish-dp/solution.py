def max_sausages(sausages):
    if not sausages: return 0
    if len(sausages) <= 2: return max(sausages)
    
    prev2, prev1 = 0, 0
    for x in sausages:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1
