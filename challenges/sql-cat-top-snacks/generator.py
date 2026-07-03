import random

snacks = ['тунец', 'сметана', 'лосось', 'креветка', 'сухарик', 'печень', 'сыр', 'индейка']
random.shuffle(snacks)
chosen = snacks[: random.randint(5, 7)]

used_votes = set()
rows = []
for i, snack in enumerate(chosen):
    while True:
        votes = random.randint(1, 40)
        if votes not in used_votes:
            used_votes.add(votes)
            break
    rows.append((i + 1, snack, votes))

values = ', '.join(f"({rid}, '{snack}', {votes})" for rid, snack, votes in rows)
GENERATED_SEED = f"INSERT INTO snacks (id, name, votes) VALUES {values};"
