
# Thymeleaf Tutorial

Thymeleaf is a modern server-side Java template engine used for web and standalone environments. Thymeleaf is particularly useful in Spring Boot applications, allowing for easy and dynamic generation of HTML pages. This tutorial will cover the basics of using Thymeleaf with Spring Boot.

---

## 1. Setting Up Thymeleaf in Spring Boot

Thymeleaf is the default templating engine for Spring Boot. Start by creating a Spring Boot project with Thymeleaf dependency.

### Adding Thymeleaf Dependency

Add Thymeleaf dependency in your `pom.xml` (for Maven) or `build.gradle` (for Gradle):

#### Maven

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

---

## 2. Basic Thymeleaf Syntax

Thymeleaf uses a special `th:` attribute to define dynamic data.

### Example HTML Template

In `src/main/resources/templates/index.html`:

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Thymeleaf Example</title>
</head>
<body>
    <h1 th:text="'Hello, ' + ${name}">Hello, User!</h1>
</body>
</html>
```

In this example, `th:text` replaces the content of `<h1>` with the variable `name`.

---

## 3. Thymeleaf Expressions

Thymeleaf expressions allow dynamic content in templates.

- **Variable Expressions**: `${...}` to display variables.
- **Text Replacement**: `th:text` replaces the text content.

### Example

```html
<p th:text="${welcomeMessage}">Welcome message here</p>
```

---

## 4. Iteration with Thymeleaf

Use `th:each` to iterate over lists.

### Example

```html
<ul>
    <li th:each="item : ${items}" th:text="${item}">Item</li>
</ul>
```

If `items` is a list of strings, this will generate a list of `<li>` elements.

---

## 5. Conditional Rendering

Use `th:if` and `th:unless` for conditional rendering.

### Example

```html
<p th:if="${isMember}">Welcome back, member!</p>
<p th:unless="${isMember}">Please sign up to continue.</p>
```

---

## 6. Form Handling

Thymeleaf integrates well with Spring’s form handling.

### Example Form

```html
<form action="#" th:action="@{/submit}" th:object="${user}" method="post">
    <label for="name">Name:</label>
    <input type="text" id="name" th:field="*{name}">
    <button type="submit">Submit</button>
</form>
```

In your controller, bind `user` to a model attribute.

---

## 7. Using Fragments

Thymeleaf fragments allow you to reuse parts of a template.

### Creating a Fragment

In `src/main/resources/templates/fragments.html`:

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
    <div th:fragment="header">
        <h1>Header Section</h1>
    </div>
</body>
</html>
```

### Including a Fragment

In your main template:

```html
<div th:include="fragments :: header"></div>
```

---

## 8. URL Expressions

Use `@{...}` for URL expressions, useful for linking resources and forms.

### Example

```html
<a th:href="@{/home}">Home</a>
```

---

## 9. Built-in Thymeleaf Utility Objects

Thymeleaf provides built-in objects like:

- `#dates`: For date formatting.
- `#numbers`: For number formatting.
- `#strings`: For string utilities.

### Example

```html
<p th:text="${#dates.format(myDate, 'yyyy-MM-dd')}">Formatted Date</p>
```

---

## Summary

This tutorial covered the basics of using Thymeleaf with Spring Boot:

1. Setting up Thymeleaf in a Spring Boot project.
2. Using Thymeleaf attributes like `th:text`, `th:each`, and `th:if`.
3. Handling forms and fragment reuse.
4. Utilizing expressions for URLs and variables.

Thymeleaf is a powerful templating engine that simplifies HTML generation in Java-based web applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
