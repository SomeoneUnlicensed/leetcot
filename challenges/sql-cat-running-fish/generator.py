import random

n = random.randint(4, 7)
rows = [(day, random.randint(1, 15)) for day in range(1, n + 1)]

values = ', '.join(f"({day}, {count})" for day, count in rows)
GENERATED_SEED = f"INSERT INTO daily_catch (day, fish_count) VALUES {values};"
