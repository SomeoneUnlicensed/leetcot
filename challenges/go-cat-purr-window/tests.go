package main

import (
	"math/rand"
	"testing"
)

func TestLongestPurrWindowVisible(t *testing.T) {
	cases := map[string]int{
		"abca":  3,
		"bbbbb": 1,
		"":      0,
	}
	for input, want := range cases {
		if got := LongestPurrWindow(input); got != want {
			t.Fatalf("LongestPurrWindow(%q) = %d, want %d", input, got, want)
		}
	}
}

// ---LEETCOT-GO-ORACLE---

func refLongestPurrWindow(s string) int {
	runes := []rune(s)
	best := 0
	for i := range runes {
		seen := map[rune]bool{}
		for j := i; j < len(runes); j++ {
			if seen[runes[j]] {
				break
			}
			seen[runes[j]] = true
			if j-i+1 > best {
				best = j - i + 1
			}
		}
	}
	return best
}

func TestLongestPurrWindowOracle(t *testing.T) {
	alphabet := []rune("abcdeeffgghhмур")
	rng := rand.New(rand.NewSource(43))
	for trial := 0; trial < 120; trial++ {
		n := rng.Intn(90)
		runes := make([]rune, n)
		for i := range runes {
			runes[i] = alphabet[rng.Intn(len(alphabet))]
		}
		input := string(runes)
		if got, want := LongestPurrWindow(input), refLongestPurrWindow(input); got != want {
			t.Fatalf("trial %d: LongestPurrWindow(%q) = %d, want %d", trial, input, got, want)
		}
	}
}
