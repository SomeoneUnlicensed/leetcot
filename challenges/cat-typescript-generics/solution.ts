// TODO: Создайте класс CatContainer с дженерик-параметром T
// Implement get() and set(value: T) methods

class CatContainer<T> {
  private value: T;

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  // TODO: Add get method
  // TODO: Add set method
}

// Test
const container = new CatContainer<string>("Барсик");
console.log(container.get()); // Should print "Барсик"
container.set("Пушок");
console.log(container.get()); // Should print "Пушок"
