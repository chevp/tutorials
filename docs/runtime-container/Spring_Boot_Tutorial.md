
# Spring Boot Tutorial

Spring Boot is a framework for building Java-based applications. It simplifies the setup of new applications by providing default configurations and minimizing the need for boilerplate code. Spring Boot is part of the larger Spring framework ecosystem, often used for creating REST APIs, microservices, and web applications.

---

## 1. Setting Up a Spring Boot Project

### Using Spring Initializr

1. Go to [Spring Initializr](https://start.spring.io/).
2. Choose your project settings, such as project type (Maven or Gradle), Java version, and dependencies.
3. Generate and download the project.
4. Extract the project files and open the project in your preferred IDE.

### Adding Dependencies

In the `pom.xml` (for Maven projects), add dependencies as needed, such as:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

---

## 2. Basic Application Structure

A typical Spring Boot application has the following structure:

```
src/main/java
├── com.example.demo
│   ├── DemoApplication.java          // Main application class
│   └── controller                    // Package for controllers
│       └── HelloController.java
└── src/main/resources
    ├── application.properties        // Configuration file
    └── static                        // Static resources
```

### Main Application Class

The main application class is annotated with `@SpringBootApplication` and contains the `main` method.

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

---

## 3. Building a REST Controller

Create a simple REST controller to handle HTTP requests.

### Example

Create a `HelloController` in the `controller` package:

```java
package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello, Spring Boot!";
    }
}
```

### Explanation

- **@RestController**: Marks this class as a REST controller.
- **@RequestMapping**: Maps URL paths to this controller.
- **@GetMapping**: Maps GET requests to `sayHello`.

---

## 4. Application Properties

The `application.properties` file in `src/main/resources` allows you to configure application settings.

### Example

```properties
server.port=8081
spring.application.name=MySpringApp
```

This example changes the default port to `8081` and sets the application name.

---

## 5. Working with Spring Boot Data JPA

Spring Data JPA simplifies database operations. Start by adding the JPA dependency:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Example Entity

Define an `Entity` class:

```java
package com.example.demo.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    // Getters and Setters
}
```

### Example Repository

Create a repository interface:

```java
package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
```

---

## 6. Using Spring Boot DevTools

Add the following dependency for hot reloading and faster development:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>
</dependency>
```

---

## 7. Spring Boot Testing

Spring Boot makes testing simple with Spring’s testing support.

### Example Test Case

```java
package com.example.demo;

import com.example.demo.controller.HelloController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DemoApplicationTests {

    @Autowired
    private HelloController helloController;

    @Test
    void contextLoads() {
        assertThat(helloController).isNotNull();
    }
}
```

---

## 8. Building and Running the Application

To build and run the application:

- **Build**: Use the following Maven command:

    ```bash
    mvn clean install
    ```

- **Run**: Start the application using:

    ```bash
    mvn spring-boot:run
    ```

---

## 9. Packaging the Application

You can package the Spring Boot application into a JAR file:

```bash
mvn clean package
```

The JAR file will be generated in the `target/` directory. Run it with:

```bash
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

---

## Summary

This tutorial covered Spring Boot basics:

1. **Setting up a Spring Boot project** with Spring Initializr.
2. **Creating REST controllers** to handle HTTP requests.
3. **Configuring application settings** using `application.properties`.
4. **Working with Spring Data JPA** to connect to a database.
5. **Testing and running** the application.

Spring Boot is a powerful framework that simplifies the development of Java applications, making it easy to build, deploy, and manage complex applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
