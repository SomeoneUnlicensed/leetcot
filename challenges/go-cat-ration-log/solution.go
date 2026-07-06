package main

import (
	"fmt"
	"strconv"
	"strings"
)

func ParseRationLog(lines []string) (int, error) {
	total := 0
	for _, line := range lines {
		parts := strings.Split(line, ":")
		if len(parts) != 2 || parts[0] == "" || len(parts[1]) < 2 {
			return 0, fmt.Errorf("bad line")
		}
		sign := parts[1][0]
		if sign != '+' && sign != '-' {
			return 0, fmt.Errorf("bad sign")
		}
		value, err := strconv.Atoi(parts[1][1:])
		if err != nil || value < 0 {
			return 0, fmt.Errorf("bad value")
		}
		if sign == '-' {
			total -= value
		} else {
			total += value
		}
	}
	return total, nil
}
