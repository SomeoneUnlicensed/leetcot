## Кот TypeScript: Утилиты 🛠️

TypeScript предоставляет встроенные утилиты для работы с типами. Давайте используем их для кошачьих данных.

### Утилиты TypeScript

1. **Partial<T>**: делает все свойства опциональными
2. **Pick<T, K>**: выбирает подмножество свойств
3. **Omit<T, K>**: исключает свойства
4. **Record<K, T>**: создает объект с определенными ключами

### Задача

Дан тип `Cat`:
```typescript
interface Cat {
  name: string;
  age: number;
  color: string;
}
```

Создайте типы:
- `CatPartial` = `Partial<Cat>` (все свойства опциональны)
- `CatNameOnly` = `Pick<Cat, 'name'>` (только имя)
- `CatWithoutAge` = `Omit<Cat, 'age'>` (без возраста)
