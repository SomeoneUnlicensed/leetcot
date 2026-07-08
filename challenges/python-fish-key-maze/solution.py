from collections import deque


def cat_key_maze(grid):
    if not grid:
        return -1

    h, w = len(grid), len(grid[0])
    start = None
    for r in range(h):
        for c in range(w):
            if grid[r][c] == "S":
                start = (r, c)
                break
        if start:
            break

    if start is None:
        return -1

    q = deque([(start[0], start[1], 0, 0)])
    seen = {(start[0], start[1], 0)}

    while q:
        r, c, keys, dist = q.popleft()
        cell = grid[r][c]
        if cell == "F":
            return dist

        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= h or nc < 0 or nc >= w:
                continue
            nxt = grid[nr][nc]
            if nxt == "#":
                continue

            next_keys = keys
            if "a" <= nxt <= "e":
                next_keys |= 1 << (ord(nxt) - ord("a"))
            if "A" <= nxt <= "E" and not (keys & (1 << (ord(nxt) - ord("A")))):
                continue

            state = (nr, nc, next_keys)
            if state not in seen:
                seen.add(state)
                q.append((nr, nc, next_keys, dist + 1))

    return -1
