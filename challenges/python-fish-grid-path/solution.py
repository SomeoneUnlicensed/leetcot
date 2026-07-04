from collections import deque


def shortest_grid_path(grid):
    if not grid or not grid[0] or grid[0][0] == 1:
        return -1
    rows = len(grid)
    cols = len(grid[0])
    if grid[rows - 1][cols - 1] == 1:
        return -1
    queue = deque([(0, 0, 1)])
    seen = {(0, 0)}
    while queue:
        r, c, dist = queue.popleft()
        if r == rows - 1 and c == cols - 1:
            return dist
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr = r + dr
            nc = c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append((nr, nc, dist + 1))
    return -1
