def is_palindrome_cat(s):
    newStr = "".join(char.lower() for char in s if char.isalnum())
    return newStr == newStr[::-1]
