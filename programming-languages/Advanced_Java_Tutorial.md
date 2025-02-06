# Advanced Java Tutorial

## Object-Oriented Programming (OOP) in Java

### Encapsulation
Encapsulation is the mechanism of restricting direct access to some of an object's components and only exposing necessary functionalities.

```java
class Account {
    private double balance;

    public Account(double balance) {
        this.balance = balance;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
}
```

### Inheritance
Inheritance allows a class to acquire the properties and methods of another class.

```java
class Vehicle {
    void start() {
        System.out.println("Vehicle started");
    }
}

class Car extends Vehicle {
    void honk() {
        System.out.println("Car is honking");
    }
}
```

### Polymorphism
Polymorphism allows one interface to be used for different types.

```java
class Animal {
    void makeSound() {
        System.out.println("Animal makes a sound");
    }
}

class Dog extends Animal {
    void makeSound() {
        System.out.println("Dog barks");
    }
}
```

---

## Java Collections Framework

### List
```java
List<String> list = new ArrayList<>();
list.add("Apple");
list.add("Banana");
list.forEach(System.out::println);
```

### Map
```java
Map<String, Integer> map = new HashMap<>();
map.put("A", 1);
map.put("B", 2);
System.out.println(map.get("A"));
```

---

## Concurrency & Multithreading

### Creating Threads
```java
class MyThread extends Thread {
    public void run() {
        System.out.println("Thread is running");
    }
}
MyThread t = new MyThread();
t.start();
```

### Using Executors
```java
ExecutorService executor = Executors.newFixedThreadPool(2);
executor.execute(() -> System.out.println("Running task"));
executor.shutdown();
```

---

## Functional Programming in Java

### Lambda Expressions
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4);
numbers.forEach(n -> System.out.println(n));
```

### Streams API
```java
List<String> names = Arrays.asList("John", "Jane", "Jack");
names.stream().filter(name -> name.startsWith("J")).forEach(System.out::println);
```

---

## Exception Handling Best Practices
```java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Cannot divide by zero");
} finally {
    System.out.println("Execution finished");
}
```

---

## I/O Streams and Serialization

### File Handling
```java
BufferedReader reader = new BufferedReader(new FileReader("test.txt"));
String line;
while ((line = reader.readLine()) != null) {
    System.out.println(line);
}
reader.close();
```

---

## JDBC and Database Connectivity
```java
Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydb", "user", "password");
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM users");
while (rs.next()) {
    System.out.println(rs.getString("name"));
}
```

---

## Unit Testing with JUnit
```java
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class CalculatorTest {
    @Test
    void testAddition() {
        assertEquals(5, 2 + 3);
    }
}
```

---

## Spring Framework Basics

### Spring Boot REST Controller
```java
@RestController
@RequestMapping("/api")
class MyController {
    @GetMapping("/hello")
    public String sayHello() {
        return "Hello, World!";
    }
}
```

---

## Design Patterns in Java

### Singleton Pattern
```java
class Singleton {
    private static Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

---

## Conclusion
This tutorial covers key concepts that often appear in professional Java assessments. Mastering these topics will help you excel in coding challenges and technical interviews.


## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
