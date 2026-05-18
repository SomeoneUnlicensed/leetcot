// Тесты для Go (заглушка)
package main

import "testing"

func TestCat(t *testing.T) {
    c := NewCat("Рыжик", 2)
    if c.Name != "Рыжик" {
        t.Errorf("Ожидалось имя Рыжик, получено %s", c.Name)
    }
    
    msg := c.Meow()
    if msg != "Мяу! Меня зовут Рыжик!" {
        t.Errorf("Неправильное Мяу: %s", msg)
    }
}
