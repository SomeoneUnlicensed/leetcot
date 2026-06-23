package main

import "fmt"

type Cat struct {
	Name string
	Age  int
}

// NewCat создает нового кота
func NewCat(name string, age int) Cat {
	// Твой код здесь
	return Cat{}
}

// Meow должен быть методом структуры Cat
// func (c Cat) Meow() string { ... }
