import { Expect, Equal } from 'type-testing';

interface CatRecord {
  id: number;
  name: string;
  owner: string;
  lastVisit: string;
}

// Проверка выбора одного свойства
type test_single = Expect<Equal<
  MyPick<CatRecord, 'id'>,
  { id: number }
>>;

// Проверка выбора нескольких свойств
type test_multiple = Expect<Equal<
  MyPick<CatRecord, 'name' | 'owner'>,
  { name: string; owner: string }
>>;

// Проверка на ошибку при выборе несуществующего ключа
// @ts-expect-error
type test_error = MyPick<CatRecord, 'favoriteFish'>;
