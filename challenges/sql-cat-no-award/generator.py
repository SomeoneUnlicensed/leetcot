import random

names = ['Мурзик', 'Васька', 'Барсик', 'Рыжик', 'Снежок', 'Дымка']
random.shuffle(names)
chosen = names[: random.randint(4, 6)]
cats = [(i + 1, name) for i, name in enumerate(chosen)]

award_names = ['Лучший охотник', 'Самый пушистый', 'Чемпион по сну', 'Мастер рыбалки']

# Give roughly half the cats at least one award, guaranteeing at least one without.
n_with_award = random.randint(1, len(cats) - 1)
cats_with_award = random.sample(cats, n_with_award)

awards = []
award_id = 1
for cid, _ in cats_with_award:
    for _ in range(random.randint(1, 2)):
        awards.append((award_id, cid, random.choice(award_names)))
        award_id += 1

cats_values = ', '.join(f"({cid},'{name}')" for cid, name in cats)
awards_values = ', '.join(f"({aid},{cid},'{aname}')" for aid, cid, aname in awards)

GENERATED_SEED = (
    f"INSERT INTO cats VALUES {cats_values}; "
    f"INSERT INTO awards VALUES {awards_values};"
)
