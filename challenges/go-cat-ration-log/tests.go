package main

import (
	"math/rand"
	"strconv"
	"strings"
	"testing"
)

func TestParseRationLogVisible(t *testing.T) {
	got, err := ParseRationLog([]string{"barsik + 10", "mira - 3", ""})
	if err != nil || got != 7 {
		t.Fatalf("ParseRationLog should parse lines like \"barsik + 10\" and skip empty lines: got %d/%v, want 7/nil", got, err)
	}
	if _, err := ParseRationLog([]string{"bad"}); err == nil {
		t.Fatalf("expected error for malformed line without name, sign and number")
	}
}

// ---LEETCOT-GO-ORACLE---

func refParseRationLog(lines []string) (int, bool) {
	total := 0
	for _, line := range lines {
		line = strings.ReplaceAll(line, "\r", "")
		if line == "" {
			continue
		}
		parts := strings.Split(line, " ")
		if len(parts) != 3 || parts[0] == "" {
			return 0, false
		}
		sign := parts[1]
		if sign != "+" && sign != "-" {
			return 0, false
		}
		value, err := strconv.Atoi(parts[2])
		if err != nil || value < 0 {
			return 0, false
		}
		if sign == "-" {
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
				lines[i] = []string{"bad", " + 10", "cat * 3", "cat + x", "cat + -1", ""}[rng.Intn(6)]
				continue
			}
			sign := "+"
			if rng.Intn(2) == 0 {
				sign = "-"
			}
			lines[i] = names[rng.Intn(len(names))] + " " + sign + " " + strconv.Itoa(rng.Intn(200))
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
