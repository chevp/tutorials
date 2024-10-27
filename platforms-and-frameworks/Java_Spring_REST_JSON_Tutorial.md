
# Java Spring REST JSON Tutorial

Spring Framework provides powerful support for building RESTful web services that produce and consume JSON data. This tutorial will guide you through creating a simple REST API using Spring Boot.

---

## 1. Prerequisites

Before getting started, ensure you have the following installed:

- **Java JDK** (8 or later): Download it from [AdoptOpenJDK](https://adoptopenjdk.net/) or [Oracle](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html).
- **Apache Maven**: Install Maven from [Apache Maven](https://maven.apache.org/download.cgi).

### Verify Installation

To check your installations, run the following commands:

```bash
java -version
mvn -version
```

---

## 2. Creating a New Spring Boot Project

You can create a new Spring Boot project using Spring Initializr.

### Using Spring Initializr

1. Go to [Spring Initializr](https://start.spring.io/).
2. Select your preferred project metadata:
   - Project: Maven Project
   - Language: Java
   - Spring Boot: (latest stable version)
3. Add dependencies such as **Spring Web** and **Spring Boot Starter JSON**.
4. Click **Generate**, which will download a ZIP file containing your project.

### Project Structure

After creating the project, the structure will look like this:

```
spring-rest-json-demo
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── example
│   │   │           └── restjson
│   │   │               └── RestJsonApplication.java
│   │   │               └── controller
│   │   │                   └── HelloWorldController.java
│   │   └── resources
│   │       └── application.properties
└── pom.xml
```

---

## 3. Creating a REST Controller

### Step 1: Create a REST Controller Class

Create a new Java class named `HelloWorldController.java` in the `controller` package:

```java
package com.example.restjson.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloWorldController {

    @GetMapping("/hello")
    public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
        return String.format("{"message": "Hello, %s!"}", name);
    }
}
```

### Explanation

- **@RestController**: Indicates that this class will handle web requests and return JSON responses.
- **@GetMapping**: Maps HTTP GET requests to the `hello` method.
- **@RequestParam**: Binds the value of the query parameter to the method parameter.

---

## 4. Running Your Application

To run your Spring Boot application, use the following command:

```bash
./mvnw spring-boot:run
```

### Accessing the REST Endpoint

Once the application is running, open your web browser or a tool like `curl` to access the endpoint:

```
http://localhost:8080/hello?name=Alice
```

You should see the output:

```json
{"message": "Hello, Alice!"}
```

### Testing with cURL

You can also test the endpoint using cURL:

```bash
curl "http://localhost:8080/hello?name=Alice"
```

---

## 5. Adding More Endpoints

You can easily add more endpoints to your controller. For example:

### Step 1: Adding a Goodbye Endpoint

```java
@GetMapping("/goodbye")
public String goodbye(@RequestParam(value = "name", defaultValue = "World") String name) {
    return String.format("{"message": "Goodbye, %s!"}", name);
}
```

### Step 2: Accessing the Goodbye Endpoint

You can access this endpoint using:

```
http://localhost:8080/goodbye?name=Bob
```

Output:

```json
{"message": "Goodbye, Bob!"}
```

---

## 6. Configuring Application Properties

You can configure your application using the `application.properties` file located in `src/main/resources`. Here you can set properties like server port, context path, etc.

### Example Configuration

```properties
server.port=8081
spring.application.name=RestJsonApp
```

---

## 7. Conclusion

This tutorial provided a simple introduction to creating a RESTful web service using Spring Boot that produces JSON responses. You learned how to set up a project, create a REST controller, and add endpoints.

### Further Reading

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
- [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
- [Spring REST API Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#spring-web)

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
