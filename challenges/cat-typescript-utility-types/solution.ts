interface Cat {
  name: string;
  age: number;
  color: string;
}

// TODO: Create CatPartial type using Partial utility
type CatPartial = any; // Replace with Partial<Cat>

// TODO: Create CatNameOnly type using Pick utility
type CatNameOnly = any; // Replace with Pick<Cat, 'name'>

// TODO: Create CatWithoutAge type using Omit utility
type CatWithoutAge = any; // Replace with Omit<Cat, 'age'>

// Tests
const catPartial: CatPartial = {}; // Should be valid
const catNameOnly: CatNameOnly = { name: "Барсик" }; // Should be valid
const catWithoutAge: CatWithoutAge = { name: "Барсик", color: "orange" }; // Should be valid
