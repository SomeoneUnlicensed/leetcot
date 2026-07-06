package main

import (
	"container/heap"
	"math/rand"
	"testing"
)

func TestMinPortalCostVisible(t *testing.T) {
	edges := []Edge{{0, 1, 5, true}, {1, 2, 1, true}, {0, 2, 20, false}}
	if got := MinPortalCost(3, edges, 0, 2, 1); got != 20 {
		t.Fatalf("got %d, want 20", got)
	}
	if got := MinPortalCost(2, []Edge{}, 0, 1, 2); got != -1 {
		t.Fatalf("got %d, want -1", got)
	}
}

// ---LEETCOT-GO-ORACLE---

type oracleState struct {
	node int
	wait int
	cost int
}

type oraclePQ []oracleState

func (p oraclePQ) Len() int            { return len(p) }
func (p oraclePQ) Less(i, j int) bool  { return p[i].cost < p[j].cost }
func (p oraclePQ) Swap(i, j int)       { p[i], p[j] = p[j], p[i] }
func (p *oraclePQ) Push(x interface{}) { *p = append(*p, x.(oracleState)) }
func (p *oraclePQ) Pop() interface{} {
	old := *p
	x := old[len(old)-1]
	*p = old[:len(old)-1]
	return x
}

func refMinPortalCost(n int, edges []Edge, start, finish int, cooldown int) int {
	if start < 0 || start >= n || finish < 0 || finish >= n {
		return -1
	}
	graph := make([][]Edge, n)
	for _, edge := range edges {
		if edge.From >= 0 && edge.From < n && edge.To >= 0 && edge.To < n {
			graph[edge.From] = append(graph[edge.From], edge)
		}
	}
	const inf = int(^uint(0) >> 1)
	dist := make([][]int, n)
	for i := range dist {
		dist[i] = make([]int, cooldown+1)
		for j := range dist[i] {
			dist[i][j] = inf
		}
	}
	dist[start][0] = 0
	q := &oraclePQ{{node: start, wait: 0, cost: 0}}
	heap.Init(q)
	for q.Len() > 0 {
		cur := heap.Pop(q).(oracleState)
		if cur.cost != dist[cur.node][cur.wait] {
			continue
		}
		if cur.node == finish {
			return cur.cost
		}
		waitAfter := cur.wait
		if waitAfter > 0 {
			waitAfter--
		}
		for _, edge := range graph[cur.node] {
			if edge.Portal && cur.wait > 0 {
				continue
			}
			nextWait := waitAfter
			if edge.Portal {
				nextWait = cooldown
			}
			nextCost := cur.cost + edge.Cost
			if nextCost < dist[edge.To][nextWait] {
				dist[edge.To][nextWait] = nextCost
				heap.Push(q, oracleState{node: edge.To, wait: nextWait, cost: nextCost})
			}
		}
	}
	return -1
}

func TestMinPortalCostOracle(t *testing.T) {
	rng := rand.New(rand.NewSource(46))
	for trial := 0; trial < 70; trial++ {
		n := 2 + rng.Intn(9)
		edges := make([]Edge, 0)
		for from := 0; from < n; from++ {
			for to := 0; to < n; to++ {
				if from != to && rng.Intn(4) == 0 {
					edges = append(edges, Edge{From: from, To: to, Cost: 1 + rng.Intn(30), Portal: rng.Intn(3) == 0})
				}
			}
		}
		start := rng.Intn(n)
		finish := rng.Intn(n)
		cooldown := rng.Intn(4)
		if got, want := MinPortalCost(n, edges, start, finish, cooldown), refMinPortalCost(n, edges, start, finish, cooldown); got != want {
			t.Fatalf("trial %d: got %d, want %d; n=%d start=%d finish=%d cooldown=%d edges=%#v", trial, got, want, n, start, finish, cooldown, edges)
		}
	}
}
