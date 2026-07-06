package main

func LongestPurrWindow(s string) int {
	last := make(map[rune]int)
	left := 0
	best := 0
	for right, ch := range []rune(s) {
		if prev, ok := last[ch]; ok && prev >= left {
			left = prev + 1
		}
		last[ch] = right
		if size := right - left + 1; size > best {
			best = size
		}
	}
	return best
}
