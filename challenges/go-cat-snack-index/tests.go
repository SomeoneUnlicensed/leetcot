package main

import (
	"encoding/json"
	"fmt"
	"reflect"
	"testing"
)

func TestBuildSnackIndexVisible(t *testing.T) {
	want := map[string]int{"tuna": 2, "milk": 1}
	if got := BuildSnackIndex([]string{"Tuna", "tuna", "", "Milk"}); !reflect.DeepEqual(got, want) {
		t.Fatalf("got %#v, want %#v", got, want)
	}
}

// ---LEETCOT-HIDDEN-TESTS---

// Fixed bank of (input, expected output) pairs, computed once offline from the
// reference solution — see scripts/generate-closed-tests. No reference
// implementation or randomness runs at grading time anymore.
type buildSnackIndexCase struct {
	name  string
	names []string
	want  map[string]int
}

var buildSnackIndexCases = []buildSnackIndexCase{
	{name: "Тест 1", names: []string{"salmon", "", "MILK", "toy", "Tuna"}, want: map[string]int{"salmon": 1, "milk": 1, "toy": 1, "tuna": 1}},
	{name: "Тест 2", names: []string{"", "", "Toy", "Tuna", "Toy", "salmon", "", "toy", "tuna", "Toy", "tuna", "Toy", "toy", "toy", "Tuna", "toy", "Tuna", "", "Tuna", "Tuna", "salmon", "salmon", "tuna", "Tuna", "salmon", "Toy", "Toy"}, want: map[string]int{"tuna": 9, "salmon": 4, "toy": 10}},
	{name: "Тест 3", names: []string{"MILK", "Tuna", "", "Toy", "Toy", "", "toy", "", "salmon", "salmon", "salmon", "MILK", "tuna", "Tuna", "Tuna", "", "toy", "Toy", "tuna", "tuna", "tuna", "Toy", "tuna", "salmon", "tuna", "", "salmon", "", "toy"}, want: map[string]int{"milk": 2, "tuna": 9, "toy": 7, "salmon": 5}},
	{name: "Тест 4", names: []string{"tuna", "Tuna", "Tuna", "MILK", "tuna", "tuna", "", "Tuna", "", "Tuna", "", "Tuna", "", "tuna", "Toy", "Tuna", "Tuna", "", "Toy", "Toy", "Tuna", "toy", "salmon", "toy", "Tuna", "tuna", "Toy", "", "toy", "toy", "salmon", "Toy", "Toy", "", "Tuna", "", "", "tuna", "", "tuna", "salmon", "salmon", "Tuna", "MILK", "toy"}, want: map[string]int{"milk": 2, "toy": 11, "salmon": 4, "tuna": 18}},
	{name: "Тест 5", names: []string{"tuna", "tuna", "Tuna", "Toy", "Tuna", "MILK", "salmon", "toy", "tuna", "Toy", "", "tuna", "Toy", "Tuna", "salmon", "", "Tuna", "tuna", "Toy", "Toy", "", "Toy", "", "Toy", "Toy", "", "", "", "tuna", "", "toy", "tuna", "Tuna", "", "toy", "", "MILK", "Tuna", "", "salmon", "toy", "MILK", "tuna", "", "", "", "tuna", "tuna"}, want: map[string]int{"toy": 12, "milk": 3, "salmon": 3, "tuna": 16}},
	{name: "Тест 6", names: []string{"salmon", "MILK", ""}, want: map[string]int{"salmon": 1, "milk": 1}},
	{name: "Тест 7", names: []string{"Toy", "tuna", "MILK", "MILK", "salmon", "Toy", "tuna", "Toy", "MILK", "toy", "tuna", "toy", "toy", "Toy", "MILK", "tuna", "", "Tuna", "Toy", "salmon", "Tuna", "Toy", "toy", "Toy", "Tuna", "toy", "toy", "tuna", "", "salmon", "Tuna", "salmon", "MILK", "Tuna", "Tuna", "Tuna", "toy", "", "salmon", "", "MILK", "tuna", "Tuna", "MILK", "toy", "tuna", "toy", "", "Toy", "salmon", "salmon", "salmon", "Tuna", "Tuna", "tuna", "salmon", "", "MILK", "", "Toy"}, want: map[string]int{"tuna": 18, "milk": 8, "salmon": 9, "toy": 18}},
	{name: "Тест 8", names: []string{"MILK", "toy", "tuna", "Tuna", "MILK", "", "salmon", "toy", "", "tuna", "salmon", "Toy", "salmon", "salmon", "MILK", "Toy", "toy", "", "toy", "Toy", "MILK", "tuna", "MILK", "tuna", "Toy", "Toy", "MILK", "tuna", "toy", "salmon", "toy", "", "salmon", "Tuna", "toy", "MILK", "Tuna", "Toy", "toy", "salmon", "salmon", "toy", "MILK", "", "MILK", "Toy", "MILK", "Tuna", "MILK", "Toy", "Tuna", "salmon", "salmon", "salmon", "Toy", "", "salmon", "", "Toy", "toy", "tuna", "MILK", "", "toy", "Toy"}, want: map[string]int{"salmon": 12, "milk": 12, "toy": 22, "tuna": 11}},
	{name: "Тест 9", names: []string{"tuna", "Toy", "salmon", "salmon", "Toy", "Tuna", "salmon", "toy", "", "salmon", "", "salmon", "toy", "tuna", "tuna", "", "Tuna", "toy", "salmon", "Toy", "Tuna", "salmon", "MILK", "tuna", "toy", "Tuna", "toy", "MILK", "MILK", "", "Tuna", "salmon", "Toy", "Tuna", "MILK", "MILK", "Toy", "Tuna", "", "", "Tuna", "tuna", "", "MILK", "Tuna", "tuna", "Toy", "MILK", "MILK", "salmon", "salmon", "Toy", "Toy", "Tuna", "Tuna", "salmon", "salmon", "tuna", "salmon", "MILK", "Toy"}, want: map[string]int{"tuna": 18, "toy": 14, "salmon": 13, "milk": 9}},
	{name: "Тест 10", names: []string{"", "tuna", "", "Tuna", "tuna", "salmon", "tuna", "Tuna", "tuna", "toy", "Toy", "Toy", "tuna", "MILK", "MILK", "Toy", "Toy", "salmon", "Tuna", "MILK", "Toy", "MILK", "Toy", "", "", "toy", "salmon", "Toy", "Tuna"}, want: map[string]int{"toy": 9, "milk": 4, "tuna": 9, "salmon": 3}},
	{name: "Тест 11", names: []string{"Toy", "", "Toy", "salmon", "Toy", "toy", "MILK", "Tuna", "salmon", "Tuna", "", "toy", "tuna", "salmon", "Tuna", "Tuna", "Tuna", "MILK", "toy", "", "salmon", "salmon", "Toy", "Toy", "tuna", "salmon", "Tuna", "", "tuna", "salmon", "salmon", "tuna", "Tuna", "MILK", "toy", "Toy", "MILK", "tuna", "Toy", "tuna", "Toy"}, want: map[string]int{"toy": 12, "salmon": 8, "milk": 4, "tuna": 13}},
	{name: "Тест 12", names: []string{"salmon", "", "salmon", "salmon", "salmon", "MILK", "tuna", "MILK", "Toy", "MILK", "MILK"}, want: map[string]int{"salmon": 4, "milk": 4, "tuna": 1, "toy": 1}},
	{name: "Тест 13", names: []string{"toy", "toy", "toy", "tuna", "toy", "Toy", "salmon", "", "toy", "tuna", "", "Tuna", "Toy", "Tuna", "tuna", "toy", "salmon", "", "salmon", "toy", "salmon", "Toy", "salmon", "MILK", "MILK", "toy", "Tuna", "tuna", "tuna", "toy", "Tuna", "tuna", "toy", "salmon", "MILK", "toy", "salmon", "Toy", "MILK", "", "", "", "tuna", "salmon", "toy", "salmon", "salmon", "toy", "MILK", "Toy"}, want: map[string]int{"toy": 18, "tuna": 11, "salmon": 10, "milk": 5}},
	{name: "Тест 14", names: []string{"MILK", "toy", "tuna", "MILK", "tuna", "", "Toy", "Toy", "salmon", "", "MILK", "Tuna", "MILK", "Tuna", "", "toy", "toy", "Tuna"}, want: map[string]int{"salmon": 1, "milk": 4, "toy": 5, "tuna": 5}},
	{name: "Тест 15", names: []string{"toy", "toy", "Toy", "Toy", "", "tuna", "MILK", "Toy", "Tuna", "salmon", "Toy", "Toy", "salmon", "Toy", "salmon", "Tuna", "tuna", "Tuna", "toy", "Toy", "Toy", "salmon", "Toy"}, want: map[string]int{"milk": 1, "salmon": 4, "toy": 12, "tuna": 5}},
	{name: "Тест 16", names: []string{"Toy", "toy", "salmon", "Tuna", "Toy", "tuna", "MILK", "", "toy", "Toy", "tuna", "MILK", "Toy", "toy", "MILK", "Toy", "tuna", "Tuna", "Toy", "toy", "tuna", "MILK", "salmon", "Tuna", "Tuna", "Toy", "", "MILK", "Tuna", "", "tuna", "", "MILK", "tuna", "", "", "salmon", "Toy", "salmon", "salmon", "tuna", "", "tuna", "Toy", "salmon", "salmon"}, want: map[string]int{"toy": 13, "salmon": 7, "tuna": 13, "milk": 6}},
	{name: "Тест 17", names: []string{"tuna", "", "Toy", "tuna", "salmon", "Tuna", "salmon", "toy", "tuna", "salmon", "", "salmon", "", "MILK", "salmon", "salmon", "toy", "toy", "tuna", "toy", "salmon", "Tuna", "Toy", "", "Tuna", "salmon", "salmon", "Toy", "toy", "", "Toy", "MILK", "", "tuna", "tuna", "salmon", "tuna", "Tuna", "toy", "MILK", "Toy", "Toy", "Tuna", "salmon", "MILK", "", "salmon", "salmon", "Tuna", "toy", "salmon", "tuna", "", "", "tuna", "toy", "MILK", "MILK", "Toy", "MILK", "tuna", "Toy", "Toy", "", "Toy", "MILK", "Toy"}, want: map[string]int{"tuna": 16, "toy": 19, "salmon": 14, "milk": 8}},
	{name: "Тест 18", names: []string{"", "Toy", "salmon", "MILK", "Tuna", "Tuna", "salmon", "Toy", "", "Tuna", "Toy", "Tuna", "salmon", "", "salmon", "salmon", "MILK", "MILK", "salmon", "Toy", "salmon", "Tuna", "tuna", "Tuna", "Toy", "", "tuna", "MILK", "Toy", "Toy", "Tuna", "MILK", "Tuna", "Toy", "Toy", "MILK", "Toy"}, want: map[string]int{"salmon": 7, "milk": 6, "tuna": 10, "toy": 10}},
	{name: "Тест 19", names: []string{"Toy", "salmon", "", "toy", "toy", "toy", "tuna", "", "Tuna", "Toy", "", "toy", "MILK", "", "", "tuna", "Tuna", "Tuna", ""}, want: map[string]int{"toy": 6, "salmon": 1, "tuna": 5, "milk": 1}},
	{name: "Тест 20", names: []string{"Tuna", "tuna", "MILK", "tuna", "", "Tuna", "salmon", "salmon", "toy", "Tuna", "toy", "toy", "toy", "salmon", "toy", "toy", "salmon", "MILK", "salmon", "salmon", "salmon", "salmon", "Tuna", "Tuna", "tuna", "salmon", "", "MILK", "salmon", "toy", "salmon", "toy", "salmon", "Toy", "MILK", "salmon", "toy", "Tuna", "MILK", "tuna", "tuna", "Tuna", "tuna", "toy", "toy", "MILK", "toy", "MILK", "salmon", "", "toy", "Toy", "Tuna", "toy", "toy", "toy", "", "tuna", "Tuna", "", "Tuna", "Toy", "MILK", "tuna", "Toy"}, want: map[string]int{"toy": 20, "tuna": 18, "milk": 8, "salmon": 14}},
	{name: "Тест 21", names: []string{"tuna", "salmon", "toy", "salmon", "Tuna", "tuna", "Tuna", "", "Toy", "Toy", "MILK", "salmon", "tuna", "tuna", "Tuna", "toy", "tuna", "MILK", "Tuna", "", "", "salmon", "Toy", "salmon", "toy", "MILK", "", "tuna", "", "tuna", "tuna", "salmon", "Toy", "", "Toy", "Toy", "Tuna", "tuna", "tuna", "salmon", "", "", "salmon", "", "MILK", "tuna", "MILK", "Toy", "tuna", "toy", "tuna", "Toy", "tuna", "Toy", "", "MILK", "Toy", "", "Tuna", "tuna", "tuna", "salmon", "MILK", "Tuna", "Toy", "", "Toy", "MILK", ""}, want: map[string]int{"salmon": 9, "toy": 16, "milk": 8, "tuna": 23}},
	{name: "Тест 22", names: []string{"toy", "salmon", "toy", "tuna", "Tuna", "toy", "Tuna", "Tuna", "tuna", "tuna", "Tuna", "Tuna", "Toy", "MILK", "tuna", "Tuna", "salmon", "tuna", "toy", "Toy", "tuna", "toy", "Tuna", "salmon", "MILK", "salmon", "tuna", "", "toy"}, want: map[string]int{"milk": 2, "toy": 8, "salmon": 4, "tuna": 14}},
	{name: "Тест 23", names: []string{"", "", "Tuna", "MILK", "", "", "MILK", "tuna", "toy", "toy", "Toy", "tuna", "MILK", "", "tuna", "salmon", "Toy", "", "MILK", "MILK", "salmon", "MILK", "Toy", "tuna", "tuna", "Tuna", "tuna", "tuna", "salmon", "Toy", "Tuna"}, want: map[string]int{"tuna": 10, "milk": 6, "toy": 6, "salmon": 3}},
	{name: "Тест 24", names: []string{"salmon", "toy", "tuna", "Toy", "Toy", "salmon", "toy", "toy", "tuna", "tuna", "salmon", "Tuna", "Toy", "salmon", "Toy", "tuna", "Toy", "toy", "Toy", "tuna", "Tuna", "toy", "", "", "toy", "salmon", "toy", "", "Toy", "Tuna", "", "MILK", "", "tuna", "tuna", "Tuna", "MILK", "salmon", "toy"}, want: map[string]int{"salmon": 6, "toy": 15, "tuna": 11, "milk": 2}},
	{name: "Тест 25", names: []string{"MILK", "salmon", "toy", "tuna", "MILK", "tuna", "tuna", "Toy", "Toy", "Tuna", "MILK", "", "Toy", "Tuna", "Tuna", "", "toy", "tuna", "salmon"}, want: map[string]int{"milk": 3, "salmon": 2, "toy": 5, "tuna": 7}},
	{name: "Тест 26", names: []string{"MILK", "Tuna", "salmon", "salmon", "salmon", "", "", "Tuna", "tuna", "toy", "tuna", "salmon", "Tuna", "tuna", "tuna", "MILK", "tuna", "Tuna", "MILK", "Toy", "salmon", "tuna", "Tuna", "Toy", "MILK", "Tuna", "Toy", "toy", "toy", "MILK", "Tuna", "Toy", "", "Tuna", "MILK", "Toy", "", "tuna", "salmon", "toy", "MILK", "Tuna", "salmon", "Toy", "tuna", "MILK", "MILK", "tuna", "toy", "", "toy", "MILK"}, want: map[string]int{"salmon": 7, "toy": 12, "milk": 10, "tuna": 18}},
	{name: "Тест 27", names: []string{"", "toy", "Toy", "tuna", "salmon", "toy", "toy", "tuna", "tuna", "", "Toy", "tuna", "", "toy", "Tuna", "tuna", "Toy", "toy", "MILK", "Tuna", "salmon", "tuna", "tuna", "Tuna", "salmon", "MILK"}, want: map[string]int{"toy": 8, "tuna": 10, "salmon": 3, "milk": 2}},
	{name: "Тест 28", names: []string{"tuna", "MILK", "Tuna", "Toy", "tuna", "", "Toy", "Toy", "", "toy", "salmon", "toy", "toy", "", "Toy", "tuna", "toy", "salmon", "MILK", "", "tuna", "salmon", "", "toy", "Toy", "tuna", "Tuna", "Toy", "tuna", "", "toy", "Toy", "Toy", "MILK", "Toy", "", "toy", "toy", "tuna", "Tuna", "salmon", "MILK", "Tuna", "toy", "", "Toy", "Toy", "salmon", "", "salmon", "", "Toy", "MILK", "MILK"}, want: map[string]int{"tuna": 11, "milk": 6, "toy": 21, "salmon": 6}},
	{name: "Тест 29", names: []string{"", "Tuna", "salmon", "tuna", "Toy", "salmon", "salmon", "Tuna", "salmon", "tuna", "toy", "salmon", "Tuna", "Tuna", "salmon", "MILK", "Tuna", "Tuna", "MILK", "Tuna", "Toy", "salmon", "", "Tuna", "Toy", "Tuna", "MILK", "", "toy", "MILK", "Tuna", "salmon", "Tuna", "Toy", "toy", "salmon", "Toy", "salmon", "Tuna", "Toy", "tuna"}, want: map[string]int{"tuna": 15, "salmon": 10, "toy": 9, "milk": 4}},
	{name: "Тест 30", names: []string{"salmon", "toy", "", "", "Toy", "Toy", "salmon", "", "Tuna", "", "salmon", "Tuna", "Toy", "toy", "Tuna", "Toy", "MILK", "MILK", "Toy", "MILK", "toy", "toy", "MILK", "MILK", "", "", "salmon", "tuna", "salmon", "", "Toy"}, want: map[string]int{"toy": 10, "tuna": 4, "milk": 5, "salmon": 5}},
	{name: "Тест 31", names: []string{"tuna", "Tuna", "salmon", "", "toy", "tuna", "tuna", "Toy", "tuna", "MILK", "salmon", "tuna", "Tuna", "MILK", "Tuna", "salmon", "Tuna", "salmon", "", "", "", "Toy", "Toy", "MILK", "Toy", "Tuna", "MILK", "toy", "Tuna", "salmon", "salmon", "salmon", "MILK", "tuna", "tuna"}, want: map[string]int{"toy": 6, "milk": 5, "tuna": 13, "salmon": 7}},
	{name: "Тест 32", names: []string{"Tuna", "MILK", "tuna", "Tuna", "", "Toy", "MILK", "Toy", "salmon", "Toy", "Tuna", "Toy", "tuna", "Tuna", "", "", "salmon", "tuna", "toy", "Tuna", "Toy", "Toy", "Tuna", "Tuna", "tuna", "salmon", "Tuna"}, want: map[string]int{"salmon": 3, "tuna": 12, "milk": 2, "toy": 7}},
	{name: "Тест 33", names: []string{"Toy", "", "Tuna", "", "Tuna", "Toy", "tuna", "tuna", "salmon", "Tuna", "toy", "", "Toy", "Toy", "MILK", "MILK", "Tuna", "Toy", "tuna", "toy", "", "MILK", "toy", "salmon", "Toy", "Toy", "tuna", "Toy", "tuna"}, want: map[string]int{"toy": 11, "tuna": 9, "salmon": 2, "milk": 3}},
	{name: "Тест 34", names: []string{"Tuna", "Tuna", "toy", "MILK", "MILK", "salmon", "Tuna", "Tuna", ""}, want: map[string]int{"milk": 2, "salmon": 1, "tuna": 4, "toy": 1}},
	{name: "Тест 35", names: []string{"tuna", "toy", "toy", "toy", "toy", "MILK", "toy", "Toy", "tuna", "tuna", "", "Toy", "MILK", "toy", "tuna", "Tuna", "Toy", "salmon", "Toy", "MILK", "Toy", "Toy", "salmon", "MILK", "tuna", "tuna", "salmon", "Toy", "MILK", "toy", "MILK", "tuna", "tuna", "MILK"}, want: map[string]int{"tuna": 9, "toy": 14, "milk": 7, "salmon": 3}},
	{name: "Тест 36", names: []string{"salmon", "MILK", "tuna", "salmon", "salmon", "MILK", "Tuna", "Toy", "tuna", "salmon", "salmon", "MILK", "tuna", "MILK", "tuna", "tuna", "salmon", "MILK", "", "tuna", "Tuna", "Tuna", "", "salmon", "Toy", "", "", "Tuna", "Tuna", "", "Toy", "Tuna", "tuna", "Tuna", "toy", "Tuna", "tuna", "Tuna", "tuna", "Toy", "salmon", "salmon", "tuna", "toy", "toy", "Tuna", "Tuna", "toy", "tuna", "", "MILK", "MILK", "toy", "", "tuna", "Toy", "tuna", "Toy", "toy", "Tuna", "Tuna", "MILK", "tuna", "MILK", "MILK"}, want: map[string]int{"salmon": 9, "milk": 10, "tuna": 27, "toy": 12}},
	{name: "Тест 37", names: []string{"tuna", "", "Toy", "toy", "toy", "Toy", "toy", "Tuna", "toy", "Toy", "salmon", "Tuna", "", "", "MILK", "MILK", "Toy", "tuna", "salmon", "Tuna", "tuna", "tuna", "toy", "toy", "Tuna", "toy", "MILK", "MILK", "salmon", "toy", "salmon", "MILK", "MILK", "Tuna", "salmon", "Tuna", "tuna", "Toy", "Toy", "Toy", "", "MILK", "Tuna", "Tuna", "Toy", "Toy", "Tuna", "Tuna", "toy", "", "Toy", "Toy", "Toy", "Tuna", "", "", "", "MILK", "Toy", "tuna"}, want: map[string]int{"tuna": 17, "toy": 22, "salmon": 5, "milk": 8}},
	{name: "Тест 38", names: []string{"salmon", "toy", "MILK", "Tuna", "tuna", "Tuna", "Toy", "MILK", "toy", "", "salmon", "tuna", "salmon", "", "Toy", "", "salmon", "Tuna", "toy", "tuna", "salmon", "Tuna", "", "tuna", "MILK", "", "", "Toy", "tuna", "", "MILK", "MILK", "tuna", "salmon", "", "MILK", "salmon", "toy"}, want: map[string]int{"salmon": 7, "toy": 7, "milk": 6, "tuna": 10}},
	{name: "Тест 39", names: []string{"", "MILK", "MILK", "Tuna", "salmon", "Toy", "salmon", "tuna", "MILK", "tuna", "Tuna", "Tuna", "Tuna", "salmon", "toy", "Toy", "MILK", "Toy", "salmon", "toy"}, want: map[string]int{"milk": 4, "tuna": 6, "salmon": 4, "toy": 5}},
	{name: "Тест 40", names: []string{"Tuna", "toy", "MILK", "Toy", "MILK", "toy", "tuna", "toy", "salmon", "", "tuna", "toy", "Tuna", "toy", "", "Toy", "", "tuna", "", "tuna", "", "Toy", "tuna", "MILK", "Tuna", "Toy", "", "tuna", "toy", "", "salmon", "MILK", "Tuna", "", "", "Tuna", "Tuna", "MILK", "MILK", "MILK", "", "Tuna", "salmon", "", "toy"}, want: map[string]int{"tuna": 13, "toy": 11, "milk": 7, "salmon": 3}},
}

func TestBuildSnackIndexClosed(t *testing.T) {
	total := len(buildSnackIndexCases)
	for i, c := range buildSnackIndexCases {
		got := BuildSnackIndex(c.names)
		if !reflect.DeepEqual(got, c.want) {
			printSummary(i, total, c.name, fmt.Sprintf("ожидалось %v, получено %v", c.want, got))
			t.FailNow()
		}
	}
	printSummary(total, total, "", "")
}

func printSummary(passed, total int, failedName, failedMessage string) {
	type caseResult struct {
		Name    string `json:"name"`
		Passed  bool   `json:"passed"`
		Message string `json:"message,omitempty"`
	}
	cases := []caseResult{}
	if failedName != "" {
		cases = append(cases, caseResult{Name: failedName, Passed: false, Message: failedMessage})
	}
	summary, _ := json.Marshal(map[string]any{"passed": passed, "total": total, "cases": cases})
	fmt.Println(string(summary))
}
