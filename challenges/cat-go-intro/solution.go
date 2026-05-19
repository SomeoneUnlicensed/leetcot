package main

// TODO: Implement Cat structure and methods for Go
type Cat struct {
name string
}

func NewCat(name string) *Cat {
return &Cat{name: name}
}

func (c *Cat) Meow() string {
// TODO: Return "Мяу, {name}!"
return ""
}

func (c *Cat) Greet(other string) string {
// TODO: Return "{name} говорит привет {other}!"
return ""
}
