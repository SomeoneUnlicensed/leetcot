package main

import (
	"math/rand"
	"reflect"
	"strings"
	"testing"
)

func TestBuildSnackIndexVisible(t *testing.T) {
	want := map[string]int{"tuna": 2, "milk": 1}
	if got := BuildSnackIndex([]string{"Tuna", "tuna", "", "Milk"}); !reflect.DeepEqual(got, want) {
		t.Fatalf("got %#v, want %#v", got, want)
	}
}

// ---LEETCOT-GO-ORACLE---

func refBuildSnackIndex(names []string) map[string]int {
	result := make(map[string]int)
	for _, name := range names {
		key := strings.ToLower(name)
		if key != "" {
			result[key]++
		}
	}
	return result
}

func TestBuildSnackIndexOracle(t *testing.T) {
	base := []string{"Tuna", "MILK", "salmon", "Toy", "", "toy", "tuna"}
	rng := rand.New(rand.NewSource(42))
	for trial := 0; trial < 100; trial++ {
		names := make([]string, rng.Intn(70))
		for i := range names {
			names[i] = base[rng.Intn(len(base))]
		}
		if got, want := BuildSnackIndex(names), refBuildSnackIndex(names); !reflect.DeepEqual(got, want) {
			t.Fatalf("trial %d: got %#v, want %#v for %v", trial, got, want, names)
		}
	}
}
