import random

places = ['окно', 'кухня', 'балкон', 'спальня', 'коридор']
random.shuffle(places)
chosen = places[: random.randint(3, 5)]
feeders = [(i + 1, place) for i, place in enumerate(chosen)]

n_with_leftovers = random.randint(1, len(feeders) - 1)
with_leftovers = random.sample(feeders, n_with_leftovers)
leftovers = [(fid, random.randint(1, 50)) for fid, _ in with_leftovers]

feeders_values = ', '.join(f"({fid}, '{place}')" for fid, place in feeders)
leftovers_values = ', '.join(f"({fid}, {grams})" for fid, grams in leftovers)

parts = [f"INSERT INTO feeders (id, name) VALUES {feeders_values};"]
if leftovers_values:
    parts.append(f"INSERT INTO leftovers (feeder_id, grams) VALUES {leftovers_values};")
GENERATED_SEED = ' '.join(parts)
