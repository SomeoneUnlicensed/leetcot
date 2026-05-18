/**
 * Привет! Я Барсик. Помоги мне заполнить мой паспорт.
 * Добавь типы данных для свойств интерфейса Cat.
 */

interface Cat {
  name: string; // Имя кота
  age: number;  // Возраст кота
  isHappy: boolean; // Счастлив ли он? (Конечно, да!)
}

/**
 * А теперь давай научим функцию кормить меня.
 * Укажи типы для аргументов catName и weight.
 */
const feedCat = (catName: string, weight: number): string => {
  return `Кот ${catName} получил порцию корма весом ${weight} грамм. Мяу!`;
};

// Проверка:
const myPassport: Cat = {
  name: "Барсик",
  age: 3,
  isHappy: true
};

console.log(feedCat(myPassport.name, 100));
