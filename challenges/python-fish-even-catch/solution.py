def count_even_fish(numbers):
    return sum(1 for number in numbers if number % 2 == 0)
