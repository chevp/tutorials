# Java Spring Boot Tutorial

## Introduction
Spring Boot is an open-source Java framework used to create stand-alone, production-grade Spring applications with minimal configuration.

## Prerequisites
- Basic knowledge of Java
- JDK 17 or later installed
- Maven or Gradle installed
- An IDE like IntelliJ IDEA or Eclipse

## Setting Up a Spring Boot Project
1. Go to [Spring Initializr](https://start.spring.io/)
2. Select the following options:
   - Project: Maven or Gradle
   - Language: Java
   - Spring Boot Version: Latest stable version
   - Dependencies: Spring Web
3. Click "Generate" to download the project.
4. Extract the ZIP and open it in your IDE.

## Creating a Simple REST API

### Step 1: Add Dependencies
Ensure `spring-boot-starter-web` is included in your `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### Step 2: Create a REST Controller
Create a file `HelloController.java` in `src/main/java/com/example/demo/controller`:
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

### Step 3: Run the Application
Run the following command in the terminal:
```sh
./mvnw spring-boot:run
```
Or if using Gradle:
```sh
./gradlew bootRun
```

### Step 4: Test the API
Open a browser or use `curl`:
```sh
curl http://localhost:8080/api/hello
```
You should see:
```
Hello, Spring Boot!
```

## Conclusion
You have successfully created a simple Spring Boot REST API. Explore additional features like database integration, security, and testing to build more robust applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
