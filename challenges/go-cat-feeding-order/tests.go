package main

import (
	"math/rand"
	"sort"
	"testing"
)

func samePlan(got, want []string) bool {
	if len(got) == 0 && len(want) == 0 {
		return true
	}
	if len(got) != len(want) {
		return false
	}
	for i := range got {
		if got[i] != want[i] {
			return false
		}
	}
	return true
}

func TestPlanFeedingOrderVisible(t *testing.T) {
	got := PlanFeedingOrder([]Task{{"wash", "feed"}, {"buy", "feed"}})
	want := []string{"buy", "wash", "feed"}
	if !samePlan(got, want) {
		t.Fatalf("got %#v, want %#v", got, want)
	}
	if got := PlanFeedingOrder([]Task{{"a", "b"}, {"b", "a"}}); len(got) != 0 {
		t.Fatalf("cycle should return empty slice, got %#v", got)
	}
}

// ---LEETCOT-GO-ORACLE---

func refPlanFeedingOrder(tasks []Task) []string {
	graph := map[string][]string{}
	indegree := map[string]int{}
	for _, task := range tasks {
		if _, ok := indegree[task.Before]; !ok {
			indegree[task.Before] = 0
		}
		if _, ok := indegree[task.After]; !ok {
			indegree[task.After] = 0
		}
		graph[task.Before] = append(graph[task.Before], task.After)
		indegree[task.After]++
	}
	ready := []string{}
	for name, degree := range indegree {
		if degree == 0 {
			ready = append(ready, name)
		}
	}
	result := []string{}
	for len(ready) > 0 {
		sort.Strings(ready)
		current := ready[0]
		ready = ready[1:]
		result = append(result, current)
		for _, next := range graph[current] {
			indegree[next]--
			if indegree[next] == 0 {
				ready = append(ready, next)
			}
		}
	}
	if len(result) != len(indegree) {
		return []string{}
	}
	return result
}

func TestPlanFeedingOrderOracle(t *testing.T) {
	names := []string{"buy", "wash", "slice", "feed", "clean", "sleep", "report", "open"}
	rng := rand.New(rand.NewSource(45))
	for trial := 0; trial < 80; trial++ {
		count := 2 + rng.Intn(len(names)-1)
		tasks := []Task{}
		for i := 0; i < count; i++ {
			for j := i + 1; j < count; j++ {
				if rng.Intn(3) == 0 {
					tasks = append(tasks, Task{names[i], names[j]})
				}
			}
		}
		if trial%17 == 0 {
			tasks = append(tasks, Task{"cycle-a", "cycle-b"}, Task{"cycle-b", "cycle-a"})
		}
		if got, want := PlanFeedingOrder(tasks), refPlanFeedingOrder(tasks); !samePlan(got, want) {
			t.Fatalf("trial %d: got %#v, want %#v for %#v", trial, got, want, tasks)
		}
	}
}
