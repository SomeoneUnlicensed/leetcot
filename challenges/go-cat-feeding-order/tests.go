package main

import (
	"encoding/json"
	"fmt"
	"reflect"
	"testing"
)

func TestPlanFeedingOrderVisible(t *testing.T) {
	got := PlanFeedingOrder([]Task{{"wash", "feed"}, {"buy", "feed"}})
	want := []string{"buy", "wash", "feed"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %#v, want %#v", got, want)
	}
	if got := PlanFeedingOrder([]Task{{"a", "b"}, {"b", "a"}}); len(got) != 0 {
		t.Fatalf("cycle should return empty slice, got %#v", got)
	}
}

// ---LEETCOT-HIDDEN-TESTS---

// Fixed bank of (input, expected output) pairs, computed once offline from the
// reference solution — see scripts/generate-closed-tests. No reference
// implementation or randomness runs at grading time anymore.
type planFeedingOrderCase struct {
	name  string
	tasks []Task
	want  []string
}

var planFeedingOrderCases = []planFeedingOrderCase{
	{name: "Тест 1", tasks: []Task{{"buy", "slice"}, {"buy", "feed"}, {"wash", "feed"}, {"feed", "clean"}, {"cycle-a", "cycle-b"}, {"cycle-b", "cycle-a"}}, want: []string{}},
	{name: "Тест 2", tasks: []Task{{"buy", "wash"}, {"buy", "report"}, {"wash", "sleep"}, {"slice", "feed"}, {"slice", "clean"}, {"slice", "sleep"}, {"slice", "report"}, {"feed", "sleep"}, {"clean", "report"}}, want: []string{"buy", "slice", "clean", "feed", "report", "wash", "sleep"}},
	{name: "Тест 3", tasks: []Task{{"buy", "wash"}}, want: []string{"buy", "wash"}},
	{name: "Тест 4", tasks: []Task{{"buy", "slice"}, {"slice", "feed"}}, want: []string{"buy", "slice", "feed"}},
	{name: "Тест 5", tasks: []Task{{"buy", "slice"}}, want: []string{"buy", "slice"}},
	{name: "Тест 6", tasks: []Task{{"buy", "wash"}, {"buy", "slice"}, {"buy", "feed"}, {"buy", "report"}, {"wash", "feed"}, {"wash", "clean"}, {"wash", "sleep"}, {"wash", "report"}, {"slice", "feed"}}, want: []string{"buy", "slice", "wash", "clean", "feed", "report", "sleep"}},
	{name: "Тест 7", tasks: []Task{{"buy", "wash"}}, want: []string{"buy", "wash"}},
	{name: "Тест 8", tasks: []Task{{"buy", "wash"}}, want: []string{"buy", "wash"}},
	{name: "Тест 9", tasks: []Task{{"buy", "slice"}, {"buy", "feed"}, {"clean", "sleep"}}, want: []string{"buy", "clean", "feed", "sleep", "slice"}},
	{name: "Тест 10", tasks: []Task{}, want: []string{}},
	{name: "Тест 11", tasks: []Task{{"buy", "wash"}, {"buy", "feed"}, {"buy", "report"}, {"wash", "clean"}, {"wash", "report"}, {"slice", "feed"}, {"feed", "report"}}, want: []string{"buy", "slice", "feed", "wash", "clean", "report"}},
	{name: "Тест 12", tasks: []Task{{"buy", "slice"}, {"wash", "sleep"}, {"slice", "clean"}, {"slice", "sleep"}}, want: []string{"buy", "slice", "clean", "wash", "sleep"}},
	{name: "Тест 13", tasks: []Task{}, want: []string{}},
	{name: "Тест 14", tasks: []Task{{"buy", "wash"}, {"slice", "feed"}}, want: []string{"buy", "slice", "feed", "wash"}},
	{name: "Тест 15", tasks: []Task{{"buy", "wash"}, {"wash", "slice"}}, want: []string{"buy", "wash", "slice"}},
	{name: "Тест 16", tasks: []Task{{"buy", "wash"}, {"buy", "slice"}}, want: []string{"buy", "slice", "wash"}},
	{name: "Тест 17", tasks: []Task{}, want: []string{}},
	{name: "Тест 18", tasks: []Task{{"cycle-a", "cycle-b"}, {"cycle-b", "cycle-a"}}, want: []string{}},
	{name: "Тест 19", tasks: []Task{{"wash", "slice"}}, want: []string{"wash", "slice"}},
	{name: "Тест 20", tasks: []Task{{"buy", "wash"}, {"buy", "clean"}, {"buy", "sleep"}, {"buy", "report"}, {"wash", "slice"}, {"wash", "feed"}, {"wash", "sleep"}, {"slice", "feed"}, {"clean", "sleep"}}, want: []string{"buy", "clean", "report", "wash", "sleep", "slice", "feed"}},
	{name: "Тест 21", tasks: []Task{{"buy", "slice"}}, want: []string{"buy", "slice"}},
	{name: "Тест 22", tasks: []Task{}, want: []string{}},
	{name: "Тест 23", tasks: []Task{{"buy", "wash"}}, want: []string{"buy", "wash"}},
	{name: "Тест 24", tasks: []Task{{"buy", "wash"}, {"buy", "feed"}, {"slice", "feed"}}, want: []string{"buy", "slice", "feed", "wash"}},
	{name: "Тест 25", tasks: []Task{{"wash", "feed"}}, want: []string{"wash", "feed"}},
	{name: "Тест 26", tasks: []Task{{"buy", "wash"}}, want: []string{"buy", "wash"}},
	{name: "Тест 27", tasks: []Task{{"buy", "feed"}, {"wash", "slice"}, {"wash", "feed"}}, want: []string{"buy", "wash", "feed", "slice"}},
	{name: "Тест 28", tasks: []Task{}, want: []string{}},
	{name: "Тест 29", tasks: []Task{{"buy", "wash"}, {"buy", "slice"}}, want: []string{"buy", "slice", "wash"}},
	{name: "Тест 30", tasks: []Task{{"buy", "wash"}, {"buy", "slice"}, {"wash", "slice"}}, want: []string{"buy", "wash", "slice"}},
	{name: "Тест 31", tasks: []Task{{"buy", "wash"}, {"buy", "slice"}, {"buy", "feed"}, {"buy", "sleep"}, {"wash", "sleep"}}, want: []string{"buy", "feed", "slice", "wash", "sleep"}},
	{name: "Тест 32", tasks: []Task{{"buy", "feed"}, {"wash", "report"}, {"slice", "sleep"}, {"feed", "clean"}, {"sleep", "report"}}, want: []string{"buy", "feed", "clean", "slice", "sleep", "wash", "report"}},
	{name: "Тест 33", tasks: []Task{{"buy", "clean"}, {"wash", "slice"}, {"wash", "clean"}}, want: []string{"buy", "wash", "clean", "slice"}},
	{name: "Тест 34", tasks: []Task{{"wash", "clean"}, {"slice", "feed"}, {"slice", "sleep"}, {"feed", "clean"}, {"feed", "sleep"}, {"clean", "sleep"}}, want: []string{"slice", "feed", "wash", "clean", "sleep"}},
	{name: "Тест 35", tasks: []Task{{"buy", "wash"}, {"buy", "feed"}, {"buy", "report"}, {"wash", "slice"}, {"wash", "clean"}, {"wash", "sleep"}, {"slice", "feed"}, {"slice", "clean"}, {"feed", "clean"}, {"feed", "sleep"}, {"cycle-a", "cycle-b"}, {"cycle-b", "cycle-a"}}, want: []string{}},
	{name: "Тест 36", tasks: []Task{{"buy", "wash"}, {"buy", "feed"}, {"slice", "feed"}}, want: []string{"buy", "slice", "feed", "wash"}},
	{name: "Тест 37", tasks: []Task{}, want: []string{}},
	{name: "Тест 38", tasks: []Task{}, want: []string{}},
	{name: "Тест 39", tasks: []Task{}, want: []string{}},
	{name: "Тест 40", tasks: []Task{{"buy", "wash"}, {"buy", "feed"}, {"buy", "report"}, {"buy", "open"}, {"wash", "report"}, {"slice", "feed"}, {"slice", "clean"}, {"slice", "report"}, {"feed", "sleep"}, {"feed", "open"}, {"clean", "sleep"}, {"clean", "report"}, {"report", "open"}}, want: []string{"buy", "slice", "clean", "feed", "sleep", "wash", "report", "open"}},
}

func TestPlanFeedingOrderClosed(t *testing.T) {
	total := len(planFeedingOrderCases)
	for i, c := range planFeedingOrderCases {
		got := PlanFeedingOrder(c.tasks)
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
