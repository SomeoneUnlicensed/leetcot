package main

import (
	"math/rand"
	"strconv"
	"testing"
)

func TestParseRationLogVisible(t *testing.T) {
	got, err := ParseRationLog([]string{"barsik:+10", "mira:-3"})
	if err != nil || got != 7 {
		t.Fatalf("got %d/%v, want 7/nil", got, err)
	}
	if _, err := ParseRationLog([]string{"bad"}); err == nil {
		t.Fatalf("expected error for malformed line")
	}
}

// ---LEETCOT-GO-ORACLE---

func refParseRationLog(lines []string) (int, bool) {
	total := 0
	for _, line := range lines {
		colon := -1
		for i, ch := range line {
			if ch == ':' {
				if colon != -1 {
					return 0, false
				}
				colon = i
			}
		}
		if colon <= 0 || colon+2 > len(line) {
			return 0, false
		}
		sign := line[colon+1]
		if sign != '+' && sign != '-' {
			return 0, false
		}
		value, err := strconv.Atoi(line[colon+2:])
		if err != nil || value < 0 {
			return 0, false
		}
		if sign == '-' {
			total -= value
		} else {
			total += value
		}
	}
	return total, true
}

func TestParseRationLogOracle(t *testing.T) {
	rng := rand.New(rand.NewSource(44))
	names := []string{"barsik", "mira", "pixel", "kot"}
	for trial := 0; trial < 100; trial++ {
		lines := make([]string, rng.Intn(40))
		for i := range lines {
			if rng.Intn(10) == 0 {
				lines[i] = []string{"bad", ":10", "cat:*3", "cat:+x"}[rng.Intn(4)]
				continue
			}
			sign := "+"
			if rng.Intn(2) == 0 {
				sign = "-"
			}
			lines[i] = names[rng.Intn(len(names))] + ":" + sign + strconv.Itoa(rng.Intn(200))
		}
		want, ok := refParseRationLog(lines)
		got, err := ParseRationLog(lines)
		if (err == nil) != ok {
			t.Fatalf("trial %d: error state mismatch for %v: got %v", trial, lines, err)
		}
		if ok && got != want {
			t.Fatalf("trial %d: got %d, want %d for %v", trial, got, want, lines)
		}
	}
}
