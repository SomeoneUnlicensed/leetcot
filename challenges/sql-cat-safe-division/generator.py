import random

channels = ['поиск', 'соцсети', 'письма', 'реклама', 'реферал']
random.shuffle(channels)
chosen = channels[: random.randint(3, 5)]

used_ratios = set()
rows = []
zero_visit_index = random.randrange(len(chosen))
for i, channel in enumerate(chosen):
    if i == zero_visit_index:
        rows.append((channel, 0, 0))
        continue
    while True:
        visits = random.randint(10, 200)
        signups = random.randint(0, visits)
        ratio = round(signups / visits, 2)
        if ratio not in used_ratios:
            used_ratios.add(ratio)
            break
    rows.append((channel, visits, signups))

values = ', '.join(f"('{channel}', {visits}, {signups})" for channel, visits, signups in rows)
GENERATED_SEED = f"INSERT INTO funnels (channel, visits, signups) VALUES {values};"
