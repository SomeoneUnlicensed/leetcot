class Cat(val name: String) {
    // TODO: Реализуйте методы meow и greet
}

// Tests
fun main() {
    val cat = Cat("Барсик")
    assert(cat.meow() == "Мяу, Барсик!")
    assert(cat.greet("Пушок") == "Барсик говорит привет Пушок!")
    println("All tests passed!")
}
