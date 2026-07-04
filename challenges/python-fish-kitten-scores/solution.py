def best_scores(attempts):
    result = {}
    for name, score in attempts:
        if name not in result or score > result[name]:
            result[name] = score
    return result
