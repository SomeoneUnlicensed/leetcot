def is_valid_brackets(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for char in s:
        if char in '([{':
            stack.append(char)
        elif not stack or stack.pop() != pairs[char]:
            return False
    return not stack
