package main

func CountFullBowls(fish []int, limit int) int {
	count := 0
	for _, value := range fish {
		if value >= limit {
			count++
		}
	}
	return count
}
