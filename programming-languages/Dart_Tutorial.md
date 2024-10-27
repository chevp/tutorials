
# Dart Tutorial

Dart is a client-optimized language developed by Google, primarily used for building web and mobile applications. It is designed for performance, productivity, and ease of use. Dart is the primary language used in Flutter, a popular framework for building cross-platform mobile applications.

---

## 1. Setting Up Dart

### Installing Dart SDK

1. Download the Dart SDK from the [Dart website](https://dart.dev/get-dart).
2. Follow the installation instructions for your operating system.

### Verifying Installation

After installing, check the Dart version by running:

```bash
dart --version
```

### Using Dart in an IDE

Dart can be used in any code editor, but **Visual Studio Code** and **IntelliJ IDEA** offer great support with plugins for Dart development.

---

## 2. Writing Your First Dart Program

Create a new file called `main.dart`:

```dart
void main() {
  print("Hello, Dart!");
}
```

Run the program with:

```bash
dart run main.dart
```

---

## 3. Variables and Data Types

### Declaring Variables

Use `var`, `final`, or `const` to declare variables in Dart.

```dart
var name = "Alice";      // Inferred type String
final age = 25;          // Immutable, set once
const pi = 3.14159;      // Constant at compile time
```

### Data Types

Dart supports common types like `int`, `double`, `String`, `bool`, and `List`.

```dart
int year = 2023;
double price = 19.99;
String greeting = "Hello";
bool isActive = true;
List<int> numbers = [1, 2, 3, 4, 5];
```

---

## 4. Control Flow

### Conditional Statements

```dart
int age = 20;
if (age >= 18) {
  print("Adult");
} else {
  print("Minor");
}
```

### Loops

#### For Loop

```dart
for (int i = 0; i < 5; i++) {
  print(i);
}
```

#### While Loop

```dart
int i = 0;
while (i < 5) {
  print(i);
  i++;
}
```

---

## 5. Functions

Functions in Dart can have return types, optional parameters, and default values.

### Basic Function

```dart
int add(int a, int b) {
  return a + b;
}
```

### Optional and Named Parameters

```dart
void greet({String name = "Guest"}) {
  print("Hello, $name!");
}
greet(name: "Alice");
```

### Arrow Function

```dart
int square(int x) => x * x;
```

---

## 6. Classes and Objects

Dart is an object-oriented language, and classes are used to create objects.

### Defining a Class

```dart
class Person {
  String name;
  int age;

  Person(this.name, this.age);

  void introduce() {
    print("Hello, my name is $name and I am $age years old.");
  }
}

void main() {
  var person = Person("Alice", 30);
  person.introduce();
}
```

### Named Constructors

```dart
class Point {
  int x;
  int y;

  Point(this.x, this.y);
  Point.origin() : x = 0, y = 0;
}

var origin = Point.origin();
```

---

## 7. Inheritance and Interfaces

Dart supports both inheritance and interfaces.

### Inheritance Example

```dart
class Animal {
  void eat() {
    print("Eating...");
  }
}

class Dog extends Animal {
  void bark() {
    print("Barking...");
  }
}

var dog = Dog();
dog.eat();
dog.bark();
```

### Abstract Classes

Abstract classes cannot be instantiated and are used as a blueprint for other classes.

```dart
abstract class Vehicle {
  void drive(); // Abstract method
}

class Car extends Vehicle {
  @override
  void drive() {
    print("Driving a car");
  }
}
```

---

## 8. Collections

Dart provides various collection types like `List`, `Set`, and `Map`.

### List

```dart
List<String> fruits = ["Apple", "Banana", "Orange"];
fruits.add("Grapes");
print(fruits[0]);
```

### Map

```dart
Map<String, int> scores = {"Alice": 90, "Bob": 80};
scores["Charlie"] = 70;
print(scores["Alice"]);
```

---

## 9. Asynchronous Programming

Dart has support for asynchronous programming using `async`, `await`, and `Future`.

### Example with Future

```dart
Future<String> fetchData() async {
  await Future.delayed(Duration(seconds: 2));
  return "Data loaded";
}

void main() async {
  print("Fetching data...");
  String data = await fetchData();
  print(data);
}
```

### Stream Example

Streams handle asynchronous events over time.

```dart
Stream<int> countStream(int max) async* {
  for (int i = 1; i <= max; i++) {
    yield i;
  }
}

void main() async {
  await for (int count in countStream(5)) {
    print(count);
  }
}
```

---

## 10. Exception Handling

Dart has built-in exception handling with `try`, `catch`, `finally`.

### Example

```dart
void main() {
  try {
    int result = 10 ~/ 0;
    print(result);
  } catch (e) {
    print("Error: $e");
  } finally {
    print("Done");
  }
}
```

---

## Summary

This tutorial covered:

1. **Setting up Dart** and writing a basic program.
2. **Working with variables, control flow, and functions**.
3. **Creating classes and using collections**.
4. **Understanding asynchronous programming** with futures and streams.
5. **Handling exceptions** for error control.

Dart is a versatile language with simple syntax, making it suitable for mobile, web, and backend development.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
