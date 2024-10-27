
# Kotlin Tutorial

Kotlin is a modern, statically typed programming language developed by JetBrains. It is designed to be fully interoperable with Java and is often used for Android development, backend services, and more.

---

## 1. Setting Up Kotlin

### Installing the Kotlin Compiler

1. **Using SDKMAN** (for Mac and Linux):

    ```bash
    sdk install kotlin
    ```

2. **Manual Download**: Download the compiler from the [Kotlin website](https://kotlinlang.org/docs/command-line.html).

### Using Kotlin in an IDE

JetBrains' IntelliJ IDEA provides the best support for Kotlin. Download IntelliJ IDEA Community Edition, which includes Kotlin support.

---

## 2. Basic Kotlin Syntax

### Hello World Program

```kotlin
fun main() {
    println("Hello, Kotlin!")
}
```

### Variables

Kotlin has two types of variables:
- `val` (immutable)
- `var` (mutable)

```kotlin
val name = "Alice"     // Immutable
var age = 25           // Mutable
```

---

## 3. Control Flow

### Conditional Statements

```kotlin
val age = 18
if (age >= 18) {
    println("You are an adult.")
} else {
    println("You are a minor.")
}
```

### When Expression

The `when` expression in Kotlin is similar to `switch` in other languages.

```kotlin
val day = 3
val dayName = when (day) {
    1 -> "Monday"
    2 -> "Tuesday"
    3 -> "Wednesday"
    else -> "Unknown"
}
println(dayName)
```

---

## 4. Functions

Functions in Kotlin can have default arguments and return types.

### Example Function

```kotlin
fun greet(name: String = "Guest") {
    println("Hello, $name!")
}

fun add(a: Int, b: Int): Int {
    return a + b
}
```

### Single-Expression Functions

```kotlin
fun multiply(a: Int, b: Int) = a * b
```

---

## 5. Classes and Objects

Kotlin is an object-oriented language and provides classes to represent objects.

### Defining a Class

```kotlin
class Person(val name: String, var age: Int) {
    fun greet() {
        println("Hello, my name is $name and I am $age years old.")
    }
}

val person = Person("Alice", 30)
person.greet()
```

### Data Classes

Data classes are used for classes that only hold data.

```kotlin
data class User(val id: Int, val name: String)
val user = User(1, "Alice")
println(user)
```

---

## 6. Null Safety

Kotlin’s type system helps eliminate `NullPointerException` by differentiating between nullable and non-nullable types.

### Nullable Types

```kotlin
var name: String? = "Alice"
name = null

// Safe call
println(name?.length)

// Elvis operator
val length = name?.length ?: 0
```

---

## 7. Collections

Kotlin has built-in support for collections such as Lists, Sets, and Maps.

### List

```kotlin
val names = listOf("Alice", "Bob", "Charlie")
println(names[1])
```

### Mutable List

```kotlin
val mutableNames = mutableListOf("Alice", "Bob")
mutableNames.add("Charlie")
```

---

## 8. Lambdas and Higher-Order Functions

Kotlin supports functional programming features, including lambdas and higher-order functions.

### Lambda Expression

```kotlin
val square = { x: Int -> x * x }
println(square(5))
```

### Higher-Order Function

```kotlin
fun operate(x: Int, y: Int, operation: (Int, Int) -> Int): Int {
    return operation(x, y)
}

val sum = operate(3, 4) { a, b -> a + b }
println(sum)
```

---

## 9. Extensions

Extensions add functionality to existing classes without modifying their source code.

### Example

```kotlin
fun String.greet() = "Hello, $this!"
println("Alice".greet())
```

---

## 10. Coroutines

Kotlin coroutines provide a way to handle asynchronous code.

### Coroutine Example

Add the dependency in your `build.gradle`:

```kotlin
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.5.2")
```

### Launching a Coroutine

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {
        delay(1000L)
        println("World!")
    }
    println("Hello,")
}
```

---

## Summary

This tutorial covered:

1. **Setting up Kotlin** and writing a basic program.
2. **Using variables, control flow, and functions**.
3. **Creating classes, handling null safety**, and working with **collections**.
4. **Using lambdas, extensions, and coroutines** for asynchronous programming.

Kotlin is a versatile language with concise syntax, making it suitable for a wide range of applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
