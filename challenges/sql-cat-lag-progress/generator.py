import random

n = random.randint(4, 6)
rows = [(day, random.randint(0, 30)) for day in range(1, n + 1)]

values = ', '.join(f"({day}, {points})" for day, points in rows)
GENERATED_SEED = f"INSERT INTO trainings (day, points) VALUES {values};"
