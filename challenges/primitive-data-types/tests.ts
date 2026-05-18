import { Expect, Equal } from 'type-testing';

// Проверка функции кормления
type test_feedCat_Params = Expect<Equal<
  Parameters<typeof feedCat>,
  [string, number]
>>;

type test_feedCat_Return = Expect<Equal<
  ReturnType<typeof feedCat>,
  string
>>;

// Проверка интерфейса кота
type test_Cat_name = Expect<Equal<Cat['name'], string>>;
type test_Cat_age = Expect<Equal<Cat['age'], number>>;
type test_Cat_isHappy = Expect<Equal<Cat['isHappy'], boolean>>;
