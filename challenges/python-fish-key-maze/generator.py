import random


CASES = [
    ["SF"],
    ["S.a", "##A", "..F"],
    ["SAF", "a..", "..."],
    ["S#F", "..."],
    ["S#F", "###", "a.A"],
    ["S.a.B", "###.#", "b...F"],
    ["S..a", "##.#", "b.BF"],
    ["S.A", "...", "..F"],
    ["S..aA.F"],
    ["S.b", ".#B", "..F"],
]


def generate_case():
    return (CASES[random.randrange(len(CASES))],)
