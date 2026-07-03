import random

keepers = ['Барсик', 'Васька', 'Мурзик', 'Соня', 'Тихон', None, None]
n = random.randint(3, 9)

rows = []
for i in range(1, n + 1):
    keeper = random.choice(keepers)
    keeper_sql = 'NULL' if keeper is None else f"'{keeper}'"
    rows.append(f"('миска-{i}', {keeper_sql})")

GENERATED_SEED = f"INSERT INTO bowls (bowl, keeper) VALUES {', '.join(rows)};"
