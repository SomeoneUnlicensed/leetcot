# Это заглушка теста для Python. 
# В реальной системе ЛитКот здесь будет запускаться pytest или unittest.

def test_greet_cats():
    assert greet_cats(["Барсик"]) == ["Мяу, Барсик!"]
    assert greet_cats(["А", "Б"]) == ["Мяу, А!", "Мяу, Б!"]
    assert greet_cats([]) == []
