import random

cats = ['Барсик', 'Мурка', 'Снежок', 'Патч', 'Рыжик', 'Дымка']
random.shuffle(cats)
n = random.randint(4, 6)
chosen = cats[:n]

pool_size = max(2, n - 2)
value_pool = random.sample(range(1, 15), pool_size)
medals = [random.choice(value_pool) for _ in chosen]
if len(set(medals)) == len(medals):
    medals[1] = medals[0]

values = ', '.join(f"('{cat}', {m})" for cat, m in zip(chosen, medals))
GENERATED_SEED = f"INSERT INTO scores (cat, medals) VALUES {values};"
