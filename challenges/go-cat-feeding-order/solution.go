package main

import "sort"

type Task struct {
	Before string
	After  string
}

func PlanFeedingOrder(tasks []Task) []string {
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
	ready := make([]string, 0)
	for name, degree := range indegree {
		if degree == 0 {
			ready = append(ready, name)
		}
	}
	result := make([]string, 0, len(indegree))
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
