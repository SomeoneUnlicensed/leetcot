package main

import (
	"math/rand"
	"testing"
)

func TestCountFullBowlsVisible(t *testing.T) {
	if got := CountFullBowls([]int{3, 8, 10, 2}, 8); got != 2 {
		t.Fatalf("expected 2, got %d", got)
	}
	if got := CountFullBowls([]int{5, 5, 5}, 6); got != 0 {
		t.Fatalf("expected 0, got %d", got)
	}
}

// ---LEETCOT-GO-ORACLE---

func refCountFullBowls(fish []int, limit int) int {
	count := 0
	for _, value := range fish {
		if value >= limit {
			count++
		}
	}
	return count
}

func TestCountFullBowlsOracle(t *testing.T) {
	rng := rand.New(rand.NewSource(41))
	for trial := 0; trial < 120; trial++ {
		n := rng.Intn(80)
		limit := rng.Intn(120) - 10
		fish := make([]int, n)
		for i := range fish {
			fish[i] = rng.Intn(140) - 20
		}
		if got, want := CountFullBowls(fish, limit), refCountFullBowls(fish, limit); got != want {
			t.Fatalf("trial %d: CountFullBowls(%v, %d) = %d, want %d", trial, fish, limit, got, want)
		}
	}
}
