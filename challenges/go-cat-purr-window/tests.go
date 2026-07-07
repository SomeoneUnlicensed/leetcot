package main

import (
	"encoding/json"
	"fmt"
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

// ---LEETCOT-HIDDEN-TESTS---

// Fixed bank of (input, expected output) pairs, computed once offline from the
// reference solution — see scripts/generate-closed-tests. No reference
// implementation or randomness runs at grading time anymore.
type longestPurrWindowCase struct {
	name string
	s    string
	want int
}

var longestPurrWindowCases = []longestPurrWindowCase{
	{name: "Тест 1", s: "уcehcрeрeмeebfbagegfрмghрcadfрмgbрdegмdcрмeheрhedghgрeууhcfhgмagahdbeggbfdрfbhgcм", want: 8},
	{name: "Тест 2", s: "fbррf", want: 3},
	{name: "Тест 3", s: "cebуbуeggdhbehgebумуedмhaaghgccchbggcehghfddbhрgрh", want: 6},
	{name: "Тест 4", s: "мfhуdfefegbeуdhfedhaммdafedрhfмagfedуhcуgceeffhggмdfheg", want: 9},
	{name: "Тест 5", s: "hagcaуурeeрccheмhhуecмbмfbgмhcgdfedehahfbffaмeмefheуfмceрhhaмруумfмaceрf", want: 7},
	{name: "Тест 6", s: "уbуeeaeegahfуdуcмgefggaechfbecdhfhhbуaуeуfhруbрeehccbeeрe", want: 7},
	{name: "Тест 7", s: "eghfcуehуabbfbcgcfуcрgурdfhehahcbeefмhdecfмceeaaefchbabfdуbff", want: 7},
	{name: "Тест 8", s: "gegaeeуhgмgce", want: 5},
	{name: "Тест 9", s: "fehhgрууahheмммgfcfachммgheммeffрcdcfрeegeуfaрcffgeрhррcрaecdggdмeмggм", want: 7},
	{name: "Тест 10", s: "рhbумbрbfрмgfffуbfafмafммb", want: 5},
	{name: "Тест 11", s: "мурууhcfhehмbacмeaмhfaceрррaffуhbhbafgggeмgebрdgfeef", want: 7},
	{name: "Тест 12", s: "egрмfgуdhfcffgffмfedgуруefeehfeрaeedfbgbeegebeggfd", want: 7},
	{name: "Тест 13", s: "chdhdfecbррgмeрacaadмechууfgрhdebaeefa", want: 9},
	{name: "Тест 14", s: "рhhhehffffhмрahbfhfcdgмaffhehefehуhef", want: 7},
	{name: "Тест 15", s: "eмgуhfbgecfbуeefуchgbffahaeeegaмbdfacga", want: 7},
	{name: "Тест 16", s: "dcccрgуggdgeghрfмfffdeffуhceebgмgмaуeуhdуfchfcмhуeмd", want: 6},
	{name: "Тест 17", s: "bуdрмgмfcaрfhebgрhмfgfffhhgecfмdмfурууfрfegfgрfefgadмdfbgcffhhf", want: 8},
	{name: "Тест 18", s: "ghhffуehрhddccgdbdуeagadefff", want: 6},
	{name: "Тест 19", s: "cfehbрgdggafahahр", want: 8},
	{name: "Тест 20", s: "уfedhfhbfagуeceуh", want: 8},
	{name: "Тест 21", s: "hhgacgуgchмeмммcgмheм", want: 6},
	{name: "Тест 22", s: "geehedeafgрbhcуhfhfeуgfebhcgaрhgcdcfeefgdhbeegef", want: 10},
	{name: "Тест 23", s: "aeaeabуgdchрchмeahfacмfhfрdfdууacacрghcahgуabрfbgрbhhhabghaebeaa", want: 9},
	{name: "Тест 24", s: "gмhfaрccehhhcaefмfрafhdaрfegfbdfмрfbaaefafcaedbeр", want: 7},
	{name: "Тест 25", s: "bdhрfhмhfhмfрafaрfрbмdgмууcccgaмуafhрурefgрfрeeaechррмcgagafhhbaрgghрhуh", want: 6},
	{name: "Тест 26", s: "ghdbhdмeрhegeмggahdрefрebbfdgbbgagммefhfмfуefgуehegfdfegadfhbgfgggebfgрaghefhceрbcумaрмa", want: 7},
	{name: "Тест 27", s: "cegeрbdуcgchgрgрehbр", want: 7},
	{name: "Тест 28", s: "ehfhgecgafhffffeрhgahegchhbecууbbhbhffрeeмgeмр", want: 6},
	{name: "Тест 29", s: "рfрcмegeуbhbdуecgfgуeaegabуeghhef", want: 8},
	{name: "Тест 30", s: "hheaegggbggcуhfccgfhg", want: 5},
	{name: "Тест 31", s: "ммhhccddfрbgcgмcaррggbghhfрfcуhcfghhffefdbafgрeaуfbfgуgрhgabgeeedhрcуaрhbdрfefc", want: 7},
	{name: "Тест 32", s: "ahcуhebfff", want: 6},
	{name: "Тест 33", s: "cbdbhdрeghegурdgafмbрff", want: 8},
	{name: "Тест 34", s: "ahbfcehfhgfechecуffcdрм", want: 6},
	{name: "Тест 35", s: "bhafрhhgecffghcмgcefffмceadebbуfgdh", want: 6},
	{name: "Тест 36", s: "dррcffahbaeeрhgрfagfbcруfdfbbbfрdрhмfffbbffbhfgмh", want: 7},
	{name: "Тест 37", s: "ehfaуeeeadfмуdумрhafgfмdfрbhмghdehуghdbcмdрbaadgaedheegр", want: 8},
	{name: "Тест 38", s: "deaffbhрaрeecbcafуgмfрbedcdeуheeghggheeрheуbcfhhмegbeмh", want: 9},
	{name: "Тест 39", s: "dуedefgfggbрfhруdgghdahafgcgaммbgaacbdaрмgрbgcfрbchgeмecмcfheafceedfdaegegegм", want: 8},
	{name: "Тест 40", s: "fgмhefbghhdeefg", want: 6},
}

func TestLongestPurrWindowClosed(t *testing.T) {
	total := len(longestPurrWindowCases)
	for i, c := range longestPurrWindowCases {
		got := LongestPurrWindow(c.s)
		if got != c.want {
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
