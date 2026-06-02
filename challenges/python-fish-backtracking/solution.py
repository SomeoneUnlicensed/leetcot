def toy_permutations(toys):
    res = []
    
    if len(toys) == 1:
        return [toys[:]]
        
    for i in range(len(toys)):
        n = toys.pop(0)
        perms = toy_permutations(toys)
        
        for p in perms:
            p.append(n)
        res.extend(perms)
        toys.append(n)
        
    return res
