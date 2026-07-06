package main

import "strings"

func BuildSnackIndex(names []string) map[string]int {
	result := make(map[string]int)
	for _, name := range names {
		key := strings.ToLower(name)
		if key == "" {
			continue
		}
		result[key]++
	}
	return result
}
