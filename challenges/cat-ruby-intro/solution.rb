class Cat
  # TODO: Создайте класс Cat с методами initialize, meow, greet
end

# Tests
cat = Cat.new("Барсик")
raise "Test failed" unless cat.meow == "Мяу, Барсик!"
raise "Test failed" unless cat.greet("Пушок") == "Барсик говорит привет Пушок!"
puts "All tests passed!"
