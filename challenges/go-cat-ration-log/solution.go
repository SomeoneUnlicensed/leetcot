package main

import (
	"fmt"
	"strconv"
	"strings"
)

func ParseRationLog(lines []string) (int, error) {
	total := 0
	for _, line := range lines {
		line = strings.ReplaceAll(line, "\r", "")
		if line == "" {
			continue
		}

		parts := strings.Split(line, " ")
		if len(parts) != 3 || parts[0] == "" {
			return 0, fmt.Errorf("bad line")
		}
		sign := parts[1]
		if sign != "+" && sign != "-" {
			return 0, fmt.Errorf("bad sign")
		}
		value, err := strconv.Atoi(parts[2])
		if err != nil || value < 0 {
			return 0, fmt.Errorf("bad value")
		}
		if sign == "-" {
			total -= value
		} else {
			total += value
		}
	}
	return total, nil
}
