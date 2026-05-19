struct Cat {
    name: String,
}

impl Cat {
    // TODO: Реализуйте методы для Cat
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_meow() {
        let cat = Cat::new("Барсик".to_string());
        assert_eq!(cat.meow(), "Мяу, Барсик!");
    }

    #[test]
    fn test_greet() {
        let cat = Cat::new("Барсик".to_string());
        assert_eq!(cat.greet("Пушок"), "Барсик говорит привет Пушок!");
    }
}
