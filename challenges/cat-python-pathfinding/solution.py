import heapq
from typing import List, Tuple, Optional


def find_cat_path(grid: List[List[int]], start: Tuple[int, int], end: Tuple[int, int]) -> Optional[List[Tuple[int, int]]]:
    """
    Find the shortest path from start to end using A* algorithm.
    
    Args:
        grid: 2D grid where 0 is walkable, 1 is obstacle
        start: (row, col) starting position
        end: (row, col) ending position
    
    Returns:
        List of coordinates representing the path, or None if no path exists
    """
    
    def heuristic(pos: Tuple[int, int]) -> int:
        """Manhattan distance heuristic"""
        return abs(pos[0] - end[0]) + abs(pos[1] - end[1])
    
    # Directions: up, down, left, right
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    # Priority queue: (f_score, counter, position)
    counter = 0
    open_set = [(heuristic(start), counter, start)]
    
    # Track visited nodes
    visited = set()
    
    # Store the path for reconstruction
    came_from = {}
    
    # g_score: cost from start to current node
    g_score = {start: 0}
    
    while open_set:
        current_f, _, current = heapq.heappop(open_set)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        # If we reached the end, reconstruct the path
        if current == end:
            path = []
            node = end
            while node in came_from:
                path.append(node)
                node = came_from[node]
            path.append(start)
            return path[::-1]
        
        # Check neighbors
        for dr, dc in directions:
            neighbor = (current[0] + dr, current[1] + dc)
            
            # Check if neighbor is within bounds
            if 0 <= neighbor[0] < len(grid) and 0 <= neighbor[1] < len(grid[0]):
                # Check if neighbor is walkable and not visited
                if grid[neighbor[0]][neighbor[1]] == 0 and neighbor not in visited:
                    tentative_g = g_score[current] + 1
                    
                    # If this path is better than any previous one
                    if neighbor not in g_score or tentative_g < g_score[neighbor]:
                        came_from[neighbor] = current
                        g_score[neighbor] = tentative_g
                        f_score = tentative_g + heuristic(neighbor)
                        
                        counter += 1
                        heapq.heappush(open_set, (f_score, counter, neighbor))
    
    # No path found
    return None
