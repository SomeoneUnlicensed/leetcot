import heapq

class FeedingQueue:
    def __init__(self):
        self.heap = []
        
    def add_cat(self, hunger_level):
        heapq.heappush(self.heap, -hunger_level)
        
    def feed_next(self):
        if not self.heap:
            return None
        return -heapq.heappop(self.heap)
