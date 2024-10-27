
# Java Spring Security Tutorial

Spring Security is a powerful and highly customizable authentication and access-control framework for Java applications. This tutorial will cover the basics of Spring Security, including setup, configuration, and examples for securing endpoints in a Spring Boot application.

---

## Prerequisites

1. **Java**: Ensure that Java is installed on your system.
2. **Spring Boot**: Basic understanding of Spring Boot is recommended.

---

## 1. Setting Up Spring Security in a Spring Boot Project

### Step 1: Create a Spring Boot Project

If you haven’t already, create a new Spring Boot project using Spring Initializr or your preferred IDE.

### Step 2: Add Spring Security Dependency

Add the Spring Security dependency in your `pom.xml` file:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

After adding the dependency, Spring Security will automatically add basic security to your application.

---

## 2. Configuring Basic Authentication

By default, Spring Security enables basic HTTP authentication. To configure this, create a security configuration class.

### Example: Basic Authentication

Create a new class `SecurityConfig` in your project to customize the security configuration:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
            .antMatchers("/public/**").permitAll()  // Allow access to /public endpoint
            .anyRequest().authenticated()           // Require authentication for other endpoints
            .and()
            .httpBasic();                           // Enable basic authentication
        return http.build();
    }
}
```

In this example, `/public/**` is open to all, while other endpoints require authentication.

---

## 3. Customizing In-Memory User Credentials

To define custom users in memory, add a `UserDetailsService` bean in your configuration:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Bean
public UserDetailsService userDetailsService() {
    UserDetails user = User.withDefaultPasswordEncoder()
        .username("user")
        .password("password")
        .roles("USER")
        .build();
    
    UserDetails admin = User.withDefaultPasswordEncoder()
        .username("admin")
        .password("admin")
        .roles("ADMIN")
        .build();

    return new InMemoryUserDetailsManager(user, admin);
}
```

---

## 4. Securing Endpoints by Roles

To control access by user roles, add `.hasRole("ROLE")` to your endpoint configurations:

```java
http
    .authorizeRequests()
    .antMatchers("/admin/**").hasRole("ADMIN")  // Only ADMINs can access /admin
    .antMatchers("/user/**").hasRole("USER")    // Only USERs can access /user
    .anyRequest().authenticated();
```

In this example, `/admin/**` is accessible only to users with the `ADMIN` role, while `/user/**` is accessible only to `USER` role users.

---

## 5. Custom Login Form

To use a custom login form instead of basic HTTP authentication, configure a login page in the security configuration:

```java
http
    .formLogin()
    .loginPage("/login")           // Custom login page
    .permitAll();                  // Allow everyone to access login page
```

Create a simple login HTML form at `/src/main/resources/templates/login.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
</head>
<body>
    <form method="post" action="/login">
        <div>
            <label>Username: <input type="text" name="username"></label>
        </div>
        <div>
            <label>Password: <input type="password" name="password"></label>
        </div>
        <button type="submit">Login</button>
    </form>
</body>
</html>
```

---

## 6. Enabling CSRF Protection

Spring Security enables CSRF protection by default. To disable it (not recommended for production), add `.csrf().disable()` to your configuration:

```java
http
    .csrf().disable()
    .authorizeRequests()
    .anyRequest().authenticated();
```

---

## 7. JWT Authentication (Optional)

For RESTful applications, JSON Web Token (JWT) is commonly used for stateless authentication.

### Adding Dependencies for JWT

In `pom.xml`:

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>
```

### Configuring JWT in Spring Security

The process includes generating a JWT upon successful login, and validating it for each request. Due to complexity, a separate tutorial is recommended for JWT in Spring.

---

## Summary

This tutorial covered the basics of setting up Spring Security, including:

1. Basic authentication and custom user roles.
2. Securing endpoints with roles.
3. Customizing login forms.
4. An introduction to JWT for REST APIs.

Spring Security is a versatile tool for securing Spring applications with both traditional and modern authentication techniques.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
