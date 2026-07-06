import random

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def make_list(values):
    head = None
    for value in reversed(values):
        head = ListNode(value, head)
    return head

def generate_case():
    size = random.randint(0, 25)
    values = [random.randint(-30, 30) for _ in range(size)]
    return (make_list(values),)
