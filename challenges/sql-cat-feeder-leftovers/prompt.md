## Кормушки с остатками (LEFT JOIN)

Нужно вывести все кормушки, даже если у них нет строки в `leftovers`. Верните `name` и `grams_left`, где отсутствующий остаток равен 0.

### Таблицы

- `feeders` (id, name)
- `leftovers` (feeder_id, grams)
