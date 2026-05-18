/**
 * Реализуй MyPick самостоятельно.
 * Подсказка: используй Mapped Types и оператор keyof.
 */
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Пример использования:
interface Kitty {
  name: string;
  purrVolume: number;
  isNaughty: boolean;
}

const justName: MyPick<Kitty, 'name'> = {
  name: "Снежок"
};
