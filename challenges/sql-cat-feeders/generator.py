import random

# tests.json's expectedQuery hardcodes "WHERE cat_id IN (1, 3)" (Мурзик=1, Барсик=3
# in the original fixture) — those two ids must stay fixed to those names; only the
# surrounding data (other cats, feeder counts/statuses) can vary.
other_names = ['Рыжик', 'Снежок', 'Дымка']
random.shuffle(other_names)
others = other_names[: random.randint(1, 2)]

cats = [(1, 'Мурзик'), (2, random.choice(['Васька', 'Пушок'])), (3, 'Барсик')]
next_id = 4
for name in others:
    cats.append((next_id, name))
    next_id += 1

feeders = []
feeder_id = 1
for cid, name in cats:
    n_feeders = random.randint(1, 2)
    for _ in range(n_feeders):
        status = 'broken' if name in ('Мурзик', 'Барсик') and random.random() < 0.7 else random.choice(['broken', 'active'])
        feeders.append((feeder_id, cid, f'{name}-Миска-{feeder_id}', status))
        feeder_id += 1

# Guarantee at least one broken feeder for each target cat, so the UPDATE has visible effect.
for target_id in (1, 3):
    if not any(cid == target_id and status == 'broken' for _, cid, _, status in feeders):
        for i, (fid, cid, fname, status) in enumerate(feeders):
            if cid == target_id:
                feeders[i] = (fid, cid, fname, 'broken')
                break

cats_values = ', '.join(f"({cid}, '{name}')" for cid, name in cats)
feeders_values = ', '.join(f"({fid}, {cid}, '{fname}', '{status}')" for fid, cid, fname, status in feeders)

GENERATED_SEED = (
    f"INSERT INTO cats (id, name) VALUES {cats_values}; "
    f"INSERT INTO feeders (id, cat_id, name, status) VALUES {feeders_values};"
)
