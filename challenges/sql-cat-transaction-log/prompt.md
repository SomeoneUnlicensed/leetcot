## Записать крупные покупки (INSERT SELECT)

Скопируйте крупные покупки в журнал аудита.

В `audit_log` нужно записать все покупки на сумму от 100 включительно. Используйте `INSERT INTO ... SELECT ...`.

### Таблицы

- `purchases` (id, cat, amount)
- `audit_log` (cat, amount)

```sql

```
