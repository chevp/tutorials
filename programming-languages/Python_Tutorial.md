
# Python Tutorial

Python is a high-level, interpreted programming language known for its readability, simplicity, and versatility. It is widely used in web development, data science, automation, artificial intelligence, and more.

---

## 1. Installing Python

### Download Python

1. Go to the [Python website](https://www.python.org/downloads/).
2. Download and install the latest version based on your operating system.

### Verifying Installation

After installation, verify it in the terminal:

```bash
python --version
```

Or, depending on the system:

```bash
python3 --version
```

---

## 2. Writing Your First Python Program

Create a new file called `hello.py`:

```python
print("Hello, Python!")
```

Run the program:

```bash
python hello.py
```

---

## 3. Basic Syntax and Variables

### Variables

Variables in Python are dynamically typed.

```python
name = "Alice"       # String
age = 25             # Integer
height = 5.8         # Float
is_student = True    # Boolean
```

### Comments

Use `#` for single-line comments and `'''` for multi-line comments.

```python
# This is a comment
''' This is
a multi-line
comment '''
```

---

## 4. Control Flow

### Conditional Statements

```python
age = 18
if age >= 18:
    print("You are an adult.")
else:
    print("You are a minor.")
```

### Loops

#### For Loop

```python
for i in range(5):
    print(i)
```

#### While Loop

```python
i = 0
while i < 5:
    print(i)
    i += 1
```

---

## 5. Functions

Functions in Python are defined using the `def` keyword.

### Example Function

```python
def greet(name="Guest"):
    print(f"Hello, {name}!")

greet("Alice")
```

### Returning Values

```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)
```

---

## 6. Data Structures

Python has several built-in data structures, including lists, tuples, sets, and dictionaries.

### List

```python
fruits = ["Apple", "Banana", "Orange"]
fruits.append("Grapes")
print(fruits[0])
```

### Dictionary

```python
person = {"name": "Alice", "age": 30}
print(person["name"])
```

### Set

```python
unique_numbers = {1, 2, 3, 4, 5}
unique_numbers.add(6)
```

---

## 7. Classes and Objects

Python is an object-oriented language and supports classes and inheritance.

### Defining a Class

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        print(f"Hello, my name is {self.name}")

person = Person("Alice", 30)
person.greet()
```

---

## 8. File Handling

Python allows easy reading and writing of files.

### Writing to a File

```python
with open("sample.txt", "w") as file:
    file.write("Hello, file!")
```

### Reading from a File

```python
with open("sample.txt", "r") as file:
    content = file.read()
    print(content)
```

---

## 9. Exception Handling

Exceptions are handled using `try`, `except`, and `finally`.

### Example

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")
finally:
    print("Execution finished")
```

---

## 10. Modules and Packages

Modules are Python files containing code, while packages are directories containing multiple modules.

### Importing Modules

```python
import math
print(math.sqrt(16))
```

### Creating a Custom Module

Create a file called `my_module.py`:

```python
def greet(name):
    return f"Hello, {name}!"
```

Import and use the module in another file:

```python
import my_module
print(my_module.greet("Alice"))
```

---

## Summary

This tutorial covered:

1. **Installing Python** and writing a simple program.
2. **Working with variables, control flow, and functions**.
3. **Creating and using data structures** like lists and dictionaries.
4. **Object-oriented programming** with classes and objects.
5. **File handling and exception handling** for robust code.

Python is a versatile and beginner-friendly language, suitable for a wide range of applications from web development to data science.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
