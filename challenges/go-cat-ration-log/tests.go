package main

import (
	"encoding/json"
	"fmt"
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

// ---LEETCOT-HIDDEN-TESTS---

// Fixed bank of (input, expected output) pairs, computed once offline from the
// reference solution — see scripts/generate-closed-tests. No reference
// implementation or randomness runs at grading time anymore.
type parseRationLogCase struct {
	name    string
	lines   []string
	want    int
	wantErr bool
}

var parseRationLogCases = []parseRationLogCase{
	{name: "Тест 1", lines: []string{"", "barsik - 111", "pixel + 157", "barsik - 186", "mira + 59", "barsik + 148", "cat + -1", "mira + 120", "pixel - 86", "mira + 88", "kot - 98", "cat + x", "kot + 13", "barsik + 92", "kot + 190", "mira + 165", "mira - 138", "mira + 139", "", "pixel + 198", "bad", "kot - 64", "bad", "mira - 84", "mira - 98", "kot - 68", "mira - 128", "pixel + 81", "pixel + 16", "pixel - 24", "barsik - 59", "pixel - 142", "kot - 183"}, want: 0, wantErr: true},
	{name: "Тест 2", lines: []string{"kot + 19", "barsik + 63", "mira + 14", "barsik + 76", "pixel + 91", "pixel - 149", "pixel + 119"}, want: 233, wantErr: false},
	{name: "Тест 3", lines: []string{"barsik - 48", "mira - 1", "mira + 114", "pixel + 33", "pixel + 91", "barsik + 128", "pixel + 162", "barsik + 151", "kot + 99", "barsik - 26", "barsik + 114", "mira - 54", "barsik + 85", "mira + 37", "cat + -1", "pixel - 84"}, want: 0, wantErr: true},
	{name: "Тест 4", lines: []string{"mira + 1", "pixel - 109"}, want: -108, wantErr: false},
	{name: "Тест 5", lines: []string{"pixel + 45"}, want: 45, wantErr: false},
	{name: "Тест 6", lines: []string{"kot + 94", "barsik + 177", "mira - 39", "", "barsik + 133", "pixel + 117", "mira - 88", "barsik + 195", "kot + 181", "mira + 28", "pixel + 2", "mira - 148"}, want: 652, wantErr: false},
	{name: "Тест 7", lines: []string{"pixel - 111", "barsik + 134", "kot + 113", "mira - 167", "pixel - 43", "kot + 161", "pixel + 105", "mira - 4", "barsik - 173", "kot - 40", "", "mira - 48"}, want: -73, wantErr: false},
	{name: "Тест 8", lines: []string{"barsik + 88", "pixel - 109", "barsik - 2", "mira + 157", "pixel - 15", "pixel - 112", "mira + 3", "kot + 196", "pixel + 21", " + 10", "mira + 93", ""}, want: 0, wantErr: true},
	{name: "Тест 9", lines: []string{"mira - 167", "", "pixel - 20", "pixel + 142", "pixel + 117", "pixel - 0", "pixel - 104", "pixel + 183", "mira - 76"}, want: 75, wantErr: false},
	{name: "Тест 10", lines: []string{"mira + 0", "pixel - 121", "kot + 60", "kot + 140", "pixel - 9", "mira - 80", "kot + 128", "mira - 24", "mira - 182", "mira + 9", "barsik + 150", "barsik + 66", "mira + 106", "cat + x", "kot + 69", "kot - 109", "kot - 142", "kot + 1", "pixel + 31", "kot - 198", "pixel - 48"}, want: 0, wantErr: true},
	{name: "Тест 11", lines: []string{"barsik - 11", "mira - 102", "barsik - 191", "kot + 103"}, want: -201, wantErr: false},
	{name: "Тест 12", lines: []string{"mira + 7", "kot - 57", "kot + 172", "barsik - 176", "barsik - 76", "pixel - 145", " + 10", "barsik - 153", " + 10", "pixel + 186", "pixel + 50", "mira - 167", "pixel + 129", "barsik + 143", "barsik - 140", "pixel - 4", "kot + 192", "mira + 70", "barsik + 7", "kot + 38", "mira + 150", "barsik + 127", "kot + 41", "pixel + 160", "mira + 86", "barsik + 21", "", "pixel + 30", "kot - 30", "barsik + 42", "barsik - 72", "barsik + 185", "mira + 9", "mira - 183", "kot + 154", "mira - 48", "pixel + 7", ""}, want: 0, wantErr: true},
	{name: "Тест 13", lines: []string{"bad", "pixel - 41", "mira + 187", "pixel + 185", "mira - 8", "barsik - 31", "pixel + 3", "mira + 144", "kot + 58", "kot + 33", "barsik - 109", "pixel + 159", "pixel + 15", "pixel + 185", "barsik - 22", " + 10", "kot + 164", "kot - 179", "kot - 67", "pixel + 76", "barsik - 89", "mira + 80", "cat + x", "barsik + 172", "mira + 157", "barsik + 78", "mira + 122", "pixel + 99", "mira - 119", "pixel + 69", "kot - 83", "kot - 38", "pixel - 154", "mira + 17", "", "kot - 188"}, want: 0, wantErr: true},
	{name: "Тест 14", lines: []string{"barsik - 185", "pixel + 105", "kot + 107", "pixel - 43", " + 10", "", "cat + -1", "pixel - 195", " + 10"}, want: 0, wantErr: true},
	{name: "Тест 15", lines: []string{"pixel + 112", "mira - 75", "pixel + 111", "mira - 182", "barsik - 27", "kot + 56", "pixel + 194", "barsik + 153", "mira - 92", "barsik + 174", "", "barsik + 25", "pixel + 39", "barsik - 152"}, want: 336, wantErr: false},
	{name: "Тест 16", lines: []string{"kot + 169", "mira + 126", "mira + 51", "kot - 179", "mira - 77", "barsik - 74", "pixel - 64", "mira + 121", "kot + 124", "pixel - 9", "mira - 198", "mira - 185", "kot - 141", "pixel + 188", "mira - 144", "barsik - 193", "kot - 126", "pixel + 104", "kot - 82", "barsik + 98", "pixel + 137", "pixel + 98", "barsik + 168", "mira - 160", "pixel - 98", "kot + 46", "barsik + 112", "mira + 170", "pixel + 184", "pixel + 74"}, want: 240, wantErr: false},
	{name: "Тест 17", lines: []string{"barsik + 100", "mira + 138", "cat + x", "pixel - 31", "mira + 53", "barsik - 128", "kot + 102", "barsik - 176", "barsik - 86", "bad", "pixel - 75", "mira + 143", "mira + 171", "mira - 64", "pixel + 193", "pixel - 170", "pixel + 62", "barsik + 76", "pixel - 43", "pixel + 184", "kot - 89", "pixel - 72", "pixel - 92"}, want: 0, wantErr: true},
	{name: "Тест 18", lines: []string{"pixel + 92", "kot - 122", "cat * 3", "barsik - 10", "barsik - 53", "barsik + 32", "kot - 33", "barsik - 1", "mira - 84", "mira - 182", "kot + 185", "pixel - 198", "barsik - 119", "kot - 35", "kot - 7", "mira - 12", "barsik - 89", "pixel + 127", "barsik + 111", "kot + 121", "pixel - 45", "barsik - 81"}, want: 0, wantErr: true},
	{name: "Тест 19", lines: []string{"mira - 20", "barsik - 66", "mira - 146", "kot + 168", "mira - 36", "pixel + 87"}, want: -13, wantErr: false},
	{name: "Тест 20", lines: []string{"mira + 143", "mira - 99", "barsik - 75", "kot - 79", "barsik + 126", "barsik + 45", "barsik + 170", "barsik + 197"}, want: 428, wantErr: false},
	{name: "Тест 21", lines: []string{"barsik - 57", "kot - 168", "pixel + 150", "barsik + 123", "kot - 155", "kot - 147", "barsik - 101", "mira + 146", "mira - 185", "cat + -1", "barsik + 97", "pixel + 172", "kot + 167", "kot + 138"}, want: 0, wantErr: true},
	{name: "Тест 22", lines: []string{"barsik - 105", "mira + 72", "barsik + 11", "mira - 38", "pixel + 52", "kot + 74", "kot + 99", "mira + 10", "pixel + 23", "mira - 157", "pixel + 102", "mira - 81", "kot - 152", "pixel - 84", "kot - 17", "pixel + 71", "mira + 197", " + 10", " + 10", "pixel - 11", "barsik + 197", "kot - 129", "barsik - 34", "mira + 75", "barsik + 52", "pixel + 12", "kot + 79", "mira + 15", "pixel - 105", "barsik + 3", "pixel - 80", "kot - 95", "barsik + 82", "cat + -1"}, want: 0, wantErr: true},
	{name: "Тест 23", lines: []string{"barsik - 126", "cat + x", "kot + 118", "barsik + 132", "mira + 48", "pixel + 156", "kot - 52", "barsik + 83", "cat + x", "", "pixel + 95"}, want: 0, wantErr: true},
	{name: "Тест 24", lines: []string{"mira + 111", "mira - 157", "mira - 178", "barsik + 175", "cat + -1", "barsik - 20", "barsik - 8", "mira - 11", "mira - 97", "kot - 14", "kot - 160", "pixel + 41", "barsik - 110", " + 10", "kot + 167", "kot - 14", "mira + 130", "barsik - 12", "cat + -1", "barsik - 193", "barsik + 174", "barsik - 40", "barsik + 23", "mira - 2", "pixel - 35", "kot - 170", "barsik - 177", "pixel + 157", "barsik - 147", "pixel - 98", "", "kot + 13"}, want: 0, wantErr: true},
	{name: "Тест 25", lines: []string{"pixel - 168", "pixel - 133", "barsik + 18", "mira + 132", "bad", "kot - 94", "barsik - 176", "pixel - 17"}, want: 0, wantErr: true},
	{name: "Тест 26", lines: []string{"mira - 150", "cat + x", "mira - 55", "kot - 139", "kot + 174", "pixel - 35", "pixel + 15", "pixel - 106", "kot - 135", "kot + 107", "mira - 47", "pixel - 105", "barsik + 24", "kot + 161", "kot - 142", "cat + -1", "pixel + 19", "mira - 51", "pixel + 84", "pixel + 158", "mira + 172", "kot + 62", "pixel + 177", "mira - 178", "kot + 89", "barsik - 75", "barsik + 64", "barsik - 76", "mira - 59", "kot + 143", "pixel + 61", "barsik + 194", "barsik + 199", "mira - 46", "kot + 27", "pixel + 15", "barsik - 140", "mira - 189", "mira - 110"}, want: 0, wantErr: true},
	{name: "Тест 27", lines: []string{"pixel + 66", "barsik + 169", "barsik + 179", "barsik + 161", " + 10", "mira - 182", "barsik + 13", "", "bad", "pixel - 192", "barsik - 93", "barsik - 180"}, want: 0, wantErr: true},
	{name: "Тест 28", lines: []string{"pixel - 175", "pixel - 7", "barsik - 31", "mira - 59", "kot - 197", "cat + -1", "kot + 14", "pixel + 146", "kot - 131", "pixel + 156", "pixel - 66", "barsik - 190", "kot + 44", "pixel - 88", "barsik - 166", "mira + 34", "barsik + 138", "barsik + 176", "mira - 101", "mira + 34", "mira + 158"}, want: 0, wantErr: true},
	{name: "Тест 29", lines: []string{"cat + x", "kot - 149", "mira - 43", "mira + 193", "mira + 12", "mira + 3", "kot - 110", "kot + 181", "pixel + 35", "kot - 22", "mira - 54", "barsik - 25", "barsik + 120", "kot + 156", "pixel + 123", "barsik + 87", "mira - 101", "barsik + 29", "kot + 169", "cat + x", "pixel - 93"}, want: 0, wantErr: true},
	{name: "Тест 30", lines: []string{"pixel - 182", "kot - 74", "barsik + 52", "bad", "", "barsik + 24", "barsik - 36", "mira + 114", "mira + 68", "mira + 126", "cat + -1", "kot - 35", "pixel - 168", "pixel - 51", "pixel + 32", "cat * 3", "pixel + 52", "mira - 138", "mira - 176", "barsik + 53", "mira - 191", "mira + 103", "kot + 171", "mira - 108", "mira - 189", "kot - 72", "pixel + 110", "mira - 170", "kot + 137"}, want: 0, wantErr: true},
	{name: "Тест 31", lines: []string{"pixel + 22", "kot + 28", "barsik + 192", "pixel - 70"}, want: 172, wantErr: false},
	{name: "Тест 32", lines: []string{"kot + 125", "mira - 17", "mira + 185", "pixel + 170", "kot + 61"}, want: 524, wantErr: false},
	{name: "Тест 33", lines: []string{"bad", "pixel + 143", "barsik - 130", "mira - 79", "barsik + 56", "barsik + 117", "kot + 148", "kot - 194", "", "barsik - 91", "mira - 78", "pixel + 0", "mira - 151", "pixel + 127"}, want: 0, wantErr: true},
	{name: "Тест 34", lines: []string{"kot - 4", "kot - 48", "mira - 75", "mira - 94", "mira + 84", "mira - 172", "barsik + 185", "pixel + 181", "mira + 125", "mira - 63", "pixel - 47", "cat + -1", "kot + 57", "pixel + 70", "barsik + 134", "barsik + 5", "mira - 188", "", "kot + 92", "kot + 124", "", "pixel - 115"}, want: 0, wantErr: true},
	{name: "Тест 35", lines: []string{"pixel - 94", "mira - 188", "kot + 99", "pixel - 154", "mira - 153", "barsik - 12", "pixel + 7", "barsik + 38", "mira - 52", "mira + 9", "kot - 5", "barsik + 190", "pixel + 1", "kot + 21", "mira + 41", "mira + 94", "kot - 104", "kot - 42", "pixel + 167", "pixel - 74", "kot - 164", "mira + 122", "barsik + 26", "pixel - 154", "kot + 86", "cat * 3", "barsik + 123", "mira - 99", "kot + 72", "mira + 184", "kot + 146", "pixel + 176", "pixel + 150", "pixel - 80", "kot - 122", "pixel + 167", "kot - 139", "barsik + 68"}, want: 0, wantErr: true},
	{name: "Тест 36", lines: []string{"mira - 149", " + 10", "mira + 149", "pixel - 27", "pixel + 126", "kot - 157", "mira + 51", "barsik + 72", "barsik - 118", "kot + 57", "barsik - 183", "mira - 153", "kot - 148", "mira - 1", "kot + 12", "cat + x", "mira + 98", "kot + 181", "kot - 36", "kot - 14", "kot - 58", "barsik + 138", "kot + 198", "barsik - 72", "pixel + 67", "barsik - 168", "barsik + 169", "cat + -1", "kot + 155", "kot + 6", "barsik - 157"}, want: 0, wantErr: true},
	{name: "Тест 37", lines: []string{"barsik + 130", "pixel - 75", "kot - 92", "pixel + 179", "barsik - 6", "mira + 140", "mira + 26", "kot + 51", "pixel + 158", "pixel - 29", "kot + 195", "pixel + 92", "pixel - 12", "pixel + 83", "barsik + 177", "barsik - 176", "barsik + 109"}, want: 950, wantErr: false},
	{name: "Тест 38", lines: []string{"cat * 3", "barsik - 123", "kot - 143", "mira + 49", "kot + 194", "kot - 22", "barsik + 181", "kot + 33", "pixel + 161", "barsik + 42", "mira + 97", "mira - 125", "pixel - 137", "barsik - 122", "barsik + 154", "pixel - 120", "mira + 130", "pixel - 191", "barsik - 86"}, want: 0, wantErr: true},
	{name: "Тест 39", lines: []string{"kot - 114", "barsik + 152", "", "pixel + 71", "barsik - 187", "pixel + 188", "mira - 8", "pixel - 31", "pixel + 154", "mira - 174", "pixel - 103", "pixel - 57", "barsik - 19", "barsik - 20", "pixel + 104", "kot + 89", "barsik + 188", "pixel + 87", "pixel + 102", "pixel - 110", "kot - 147", "pixel - 70", "barsik + 164", "barsik - 192", "pixel - 53", "barsik + 53", "mira - 14", "barsik - 31", "barsik + 125"}, want: 147, wantErr: false},
	{name: "Тест 40", lines: []string{"mira - 191", "cat * 3", "mira - 120", "mira + 35", "pixel - 31", "kot - 176", "mira + 35", "kot + 157", "bad", "mira + 14", "mira - 70", "mira - 196", "", "mira - 97", "mira + 96", "barsik + 47", "kot - 94", "barsik - 155", "barsik - 134"}, want: 0, wantErr: true},
}

func TestParseRationLogClosed(t *testing.T) {
	total := len(parseRationLogCases)
	for i, c := range parseRationLogCases {
		got, err := ParseRationLog(c.lines)
		if (err != nil) != c.wantErr {
			printSummary(i, total, c.name, fmt.Sprintf("ожидалось error=%t, получено error=%v", c.wantErr, err))
			t.FailNow()
		}
		if !c.wantErr && got != c.want {
			printSummary(i, total, c.name, fmt.Sprintf("ожидалось %d, получено %d", c.want, got))
			t.FailNow()
		}
	}
	printSummary(total, total, "", "")
}

func printSummary(passed, total int, failedName, failedMessage string) {
	type caseResult struct {
		Name    string `json:"name"`
		Passed  bool   `json:"passed"`
		Message string `json:"message,omitempty"`
	}
	cases := []caseResult{}
	if failedName != "" {
		cases = append(cases, caseResult{Name: failedName, Passed: false, Message: failedMessage})
	}
	summary, _ := json.Marshal(map[string]any{"passed": passed, "total": total, "cases": cases})
	fmt.Println(string(summary))
}
