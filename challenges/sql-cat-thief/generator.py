import random

names = ['Мурзик', 'Барсик', 'Васька', 'Рыжик', 'Снежок']
random.shuffle(names)
chosen = names[: random.randint(3, 5)]
cats = [(i + 1, name, random.choice(['black', 'white', 'ginger', 'gray'])) for i, name in enumerate(chosen)]

actions = ['sleeping', 'playing', 'eating', 'napping']
logs = []
log_id = 1
minute = 0
for cid, _, _ in cats:
    for _ in range(random.randint(1, 3)):
        minute += random.randint(5, 20)
        logs.append((log_id, cid, random.choice(actions), minute))
        log_id += 1

# Exactly one 'stole_sausage' event, strictly the latest by timestamp, so the
# answer is unambiguous regardless of how ties would otherwise resolve.
thief_id = random.choice(cats)[0]
minute += 30
logs.append((log_id, thief_id, 'stole_sausage', minute))

cats_values = ', '.join(f"({cid}, '{name}', '{color}')" for cid, name, color in cats)
logs_values = ', '.join(
    f"({lid}, {cid}, '{action}', '2026-06-24 {12 + m // 60:02d}:{m % 60:02d}:00')"
    for lid, cid, action, m in logs
)

GENERATED_SEED = (
    f"INSERT INTO cats (id, name, color) VALUES {cats_values}; "
    f"INSERT INTO action_logs (id, cat_id, action, created_at) VALUES {logs_values};"
)
