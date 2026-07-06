package main

import "container/heap"

type Edge struct {
	From   int
	To     int
	Cost   int
	Portal bool
}

type state struct {
	node int
	wait int
	cost int
}

type pq []state

func (p pq) Len() int            { return len(p) }
func (p pq) Less(i, j int) bool  { return p[i].cost < p[j].cost }
func (p pq) Swap(i, j int)       { p[i], p[j] = p[j], p[i] }
func (p *pq) Push(x interface{}) { *p = append(*p, x.(state)) }
func (p *pq) Pop() interface{} {
	old := *p
	x := old[len(old)-1]
	*p = old[:len(old)-1]
	return x
}

func MinPortalCost(n int, edges []Edge, start, finish int, cooldown int) int {
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
	q := &pq{{node: start, wait: 0, cost: 0}}
	heap.Init(q)
	for q.Len() > 0 {
		cur := heap.Pop(q).(state)
		if cur.cost != dist[cur.node][cur.wait] {
			continue
		}
		if cur.node == finish {
			return cur.cost
		}
		nextWaitAfterMove := cur.wait
		if nextWaitAfterMove > 0 {
			nextWaitAfterMove--
		}
		for _, edge := range graph[cur.node] {
			if edge.Portal && cur.wait > 0 {
				continue
			}
			wait := nextWaitAfterMove
			if edge.Portal {
				wait = cooldown
			}
			nextCost := cur.cost + edge.Cost
			if nextCost < dist[edge.To][wait] {
				dist[edge.To][wait] = nextCost
				heap.Push(q, state{node: edge.To, wait: wait, cost: nextCost})
			}
		}
	}
	return -1
}
