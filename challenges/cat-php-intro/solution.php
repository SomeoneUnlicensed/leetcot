<?php

class Cat {
    // TODO: Создайте класс Cat с именем
    // Добавьте конструктор и методы meow, greet
}

// Tests
$cat = new Cat("Барсик");
assert($cat->meow() === "Мяу, Барсик!");
assert($cat->greet("Пушок") === "Барсик говорит привет Пушок!");
