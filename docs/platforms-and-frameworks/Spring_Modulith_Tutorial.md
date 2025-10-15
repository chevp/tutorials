# Spring Modulith Tutorial

## Introduction

Spring Modulith is a framework that helps developers build well-structured, modular Spring Boot applications following Domain-Driven Design (DDD) principles. It provides tools for defining, verifying, and documenting application module boundaries, making monolithic applications more maintainable and easier to evolve into microservices if needed.

---

## What is Spring Modulith?

Spring Modulith is a toolkit that enhances Spring Boot applications with:

- **Modular Architecture**: Define logical application modules with clear boundaries
- **Verification Tools**: Automatically verify architectural rules and dependencies
- **Event-Driven Communication**: Enable loosely coupled modules through application events
- **Documentation Generation**: Automatically generate module documentation and diagrams
- **Observability**: Built-in support for module-level tracing and metrics

### Key Concepts

- **Application Module**: A self-contained unit with specific business capabilities
- **Module API**: Public interfaces exposed to other modules
- **Module Internals**: Implementation details hidden from other modules
- **Module Events**: Asynchronous communication between modules
- **Module Canvas**: Visual documentation of module structure

---

## Why Use Spring Modulith?

### Benefits

- **Clear Boundaries**: Enforce module boundaries at compile time
- **Maintainability**: Easier to understand and modify code with explicit module structure
- **Team Scalability**: Different teams can work on different modules independently
- **Testing**: Test modules in isolation with minimal dependencies
- **Migration Path**: Provides a clear path to microservices if needed
- **Documentation**: Auto-generated architecture documentation stays up-to-date

### When to Use Spring Modulith

- Building new Spring Boot applications with complex domain logic
- Refactoring monolithic applications into better-structured modules
- Teams wanting to enforce architectural boundaries
- Applications that may evolve into microservices

---

## Prerequisites

- Java 17 or later
- Spring Boot 3.x
- Maven or Gradle
- Basic understanding of Spring Boot and DDD concepts
- IDE with Spring Boot support (IntelliJ IDEA, Eclipse, or VS Code)

---

## Setting Up Spring Modulith

### Step 1: Create a Spring Boot Project

Using [Spring Initializr](https://start.spring.io/):

1. **Project**: Maven
2. **Language**: Java
3. **Spring Boot**: 3.2.0 or later
4. **Dependencies**:
   - Spring Web
   - Spring Data JPA
   - H2 Database (for examples)

### Step 2: Add Spring Modulith Dependencies

Add to your `pom.xml`:

```xml
<properties>
    <spring-modulith.version>1.1.0</spring-modulith.version>
</properties>

<dependencies>
    <!-- Spring Modulith Core -->
    <dependency>
        <groupId>org.springframework.modulith</groupId>
        <artifactId>spring-modulith-starter-core</artifactId>
    </dependency>

    <!-- Spring Modulith JPA Support -->
    <dependency>
        <groupId>org.springframework.modulith</groupId>
        <artifactId>spring-modulith-starter-jpa</artifactId>
    </dependency>

    <!-- Spring Modulith Test Support -->
    <dependency>
        <groupId>org.springframework.modulith</groupId>
        <artifactId>spring-modulith-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.modulith</groupId>
            <artifactId>spring-modulith-bom</artifactId>
            <version>${spring-modulith.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

For Gradle (`build.gradle`):

```gradle
ext {
    springModulithVersion = '1.1.0'
}

dependencies {
    implementation 'org.springframework.modulith:spring-modulith-starter-core'
    implementation 'org.springframework.modulith:spring-modulith-starter-jpa'
    testImplementation 'org.springframework.modulith:spring-modulith-starter-test'
}

dependencyManagement {
    imports {
        mavenBom "org.springframework.modulith:spring-modulith-bom:${springModulithVersion}"
    }
}
```

---

## Creating a Modular Application

### Application Structure

A typical Spring Modulith application follows this structure:

```
src/main/java/com/example/myapp/
├── MyApplication.java              # Main application class
├── order/                          # Order module
│   ├── Order.java                 # Domain entity
│   ├── OrderService.java          # Module API
│   ├── internal/                  # Internal implementations
│   │   ├── OrderRepository.java
│   │   └── OrderController.java
├── inventory/                      # Inventory module
│   ├── InventoryService.java      # Module API
│   ├── Product.java
│   └── internal/
│       ├── InventoryRepository.java
│       └── InventoryController.java
└── customer/                       # Customer module
    ├── Customer.java
    ├── CustomerService.java
    └── internal/
        ├── CustomerRepository.java
        └── CustomerController.java
```

### Module Package Structure

**Key Rules:**
- Top-level package represents a module (e.g., `order`, `inventory`)
- Classes in the module root are **public API**
- Classes in `internal` package are **private implementation**
- Other modules can only depend on public API classes

---

## Example: Building an E-Commerce Application

### Step 1: Define the Order Module

**Order.java** (Public API):

```java
package com.example.ecommerce.order;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private Long productId;
    private Integer quantity;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private OrderStatus status;

    // Constructors, getters, setters

    public Order() {}

    public Order(Long customerId, Long productId, Integer quantity, BigDecimal totalAmount) {
        this.customerId = customerId;
        this.productId = productId;
        this.quantity = quantity;
        this.totalAmount = totalAmount;
        this.orderDate = LocalDateTime.now();
        this.status = OrderStatus.PENDING;
    }

    public enum OrderStatus {
        PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    }

    // Getters and setters...
}
```

**OrderService.java** (Public API):

```java
package com.example.ecommerce.order;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderManagement orderManagement;

    public OrderService(OrderManagement orderManagement) {
        this.orderManagement = orderManagement;
    }

    @Transactional
    public Order placeOrder(Long customerId, Long productId, Integer quantity, BigDecimal amount) {
        return orderManagement.createOrder(customerId, productId, quantity, amount);
    }

    public Order findOrderById(Long orderId) {
        return orderManagement.getOrder(orderId);
    }
}
```

**internal/OrderManagement.java** (Internal Implementation):

```java
package com.example.ecommerce.order.internal;

import com.example.ecommerce.order.Order;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
class OrderManagement {

    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher events;

    OrderManagement(OrderRepository orderRepository, ApplicationEventPublisher events) {
        this.orderRepository = orderRepository;
        this.events = events;
    }

    Order createOrder(Long customerId, Long productId, Integer quantity, BigDecimal amount) {
        Order order = new Order(customerId, productId, quantity, amount);
        order = orderRepository.save(order);

        // Publish event for other modules
        events.publishEvent(new OrderPlacedEvent(order.getId(), productId, quantity));

        return order;
    }

    Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }
}
```

**internal/OrderRepository.java**:

```java
package com.example.ecommerce.order.internal;

import com.example.ecommerce.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;

interface OrderRepository extends JpaRepository<Order, Long> {
}
```

### Step 2: Define Module Events

**OrderPlacedEvent.java** (Public API):

```java
package com.example.ecommerce.order;

public record OrderPlacedEvent(Long orderId, Long productId, Integer quantity) {
}
```

### Step 3: Define the Inventory Module

**InventoryService.java** (Public API):

```java
package com.example.ecommerce.inventory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final InventoryManagement inventoryManagement;

    public InventoryService(InventoryManagement inventoryManagement) {
        this.inventoryManagement = inventoryManagement;
    }

    @Transactional
    public void reserveStock(Long productId, Integer quantity) {
        inventoryManagement.reserve(productId, quantity);
    }

    public boolean isAvailable(Long productId, Integer quantity) {
        return inventoryManagement.checkAvailability(productId, quantity);
    }
}
```

**internal/InventoryManagement.java**:

```java
package com.example.ecommerce.inventory.internal;

import com.example.ecommerce.order.OrderPlacedEvent;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
class InventoryManagement {

    private final InventoryRepository inventoryRepository;

    InventoryManagement(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    // Listen to events from other modules
    @ApplicationModuleListener
    void onOrderPlaced(OrderPlacedEvent event) {
        reserve(event.productId(), event.quantity());
    }

    void reserve(Long productId, Integer quantity) {
        // Reserve inventory logic
        System.out.println("Reserved " + quantity + " units of product " + productId);
    }

    boolean checkAvailability(Long productId, Integer quantity) {
        // Check availability logic
        return true;
    }
}
```

---

## Testing Modules

### Verifying Module Structure

Create a test to verify your architecture:

```java
package com.example.ecommerce;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

class ModularityTests {

    ApplicationModules modules = ApplicationModules.of(EcommerceApplication.class);

    @Test
    void verifyModuleStructure() {
        // Verify module structure and dependencies
        modules.verify();
    }

    @Test
    void documentModules() {
        // Generate documentation
        new Documenter(modules)
            .writeDocumentation()
            .writeIndividualModulesAsPlantUml();
    }

    @Test
    void verifyNoCycles() {
        // Ensure no circular dependencies
        modules.verify();
    }
}
```

### Integration Testing a Module

```java
package com.example.ecommerce.order;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.Scenario;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@ApplicationModuleTest
class OrderModuleTests {

    @Autowired
    OrderService orderService;

    @Test
    void shouldPlaceOrderAndPublishEvent(Scenario scenario) {
        // Given
        Long customerId = 1L;
        Long productId = 100L;
        Integer quantity = 2;
        BigDecimal amount = BigDecimal.valueOf(99.99);

        // When
        Order order = orderService.placeOrder(customerId, productId, quantity, amount);

        // Then
        assertThat(order.getId()).isNotNull();
        assertThat(order.getStatus()).isEqualTo(Order.OrderStatus.PENDING);

        // Verify event was published
        scenario.stimulate(() -> orderService.placeOrder(customerId, productId, quantity, amount))
            .andWaitForEventOfType(OrderPlacedEvent.class)
            .toArrive();
    }
}
```

---

## Advanced Features

### 1. Defining Explicit Module Dependencies

Create `package-info.java` in your module:

```java
@org.springframework.modulith.ApplicationModule(
    displayName = "Order Management",
    allowedDependencies = {"customer", "inventory"}
)
package com.example.ecommerce.order;
```

### 2. Named Interfaces

Expose specific sub-packages as APIs:

```java
@org.springframework.modulith.NamedInterface("api")
package com.example.ecommerce.order.api;
```

### 3. Event Externalization

Publish events to external systems:

```xml
<dependency>
    <groupId>org.springframework.modulith</groupId>
    <artifactId>spring-modulith-events-kafka</artifactId>
</dependency>
```

```java
@ApplicationModuleListener
@Externalized("orders::placed")
void onOrderPlaced(OrderPlacedEvent event) {
    // This event will be published to Kafka topic
}
```

### 4. Async Event Processing

```java
@ApplicationModuleListener
@Async
void onOrderPlaced(OrderPlacedEvent event) {
    // Process asynchronously
}
```

### 5. Event Publication Registry

Track event publication status:

```java
@Autowired
CompletedEventPublications publications;

// Query completed publications
publications.findAll().forEach(System.out::println);
```

---

## Observability and Monitoring

### Enable Actuator

Add dependency:

```xml
<dependency>
    <groupId>org.springframework.modulith</groupId>
    <artifactId>spring-modulith-actuator</artifactId>
</dependency>
```

### Expose Module Endpoints

In `application.properties`:

```properties
management.endpoints.web.exposure.include=modulith
```

Access module information:
```
GET http://localhost:8080/actuator/modulith
```

---

## Generating Documentation

Spring Modulith can automatically generate module documentation and diagrams.

### Generate Documentation

Run the test:

```java
@Test
void writeDocumentation() {
    ApplicationModules modules = ApplicationModules.of(Application.class);

    new Documenter(modules)
        .writeDocumentation()                    // Generate Asciidoc
        .writeIndividualModulesAsPlantUml()      // Generate UML diagrams
        .writeModulesAsPlantUml();               // Generate component diagram
}
```

This generates:
- `target/modulith-docs/modules.adoc` - Module overview
- `target/modulith-docs/*.puml` - PlantUML diagrams

---

## Best Practices

### 1. Keep Modules Cohesive
- Group related functionality together
- Each module should have a clear business purpose

### 2. Minimize Dependencies
- Modules should depend on as few other modules as possible
- Avoid circular dependencies

### 3. Use Events for Loose Coupling
- Prefer asynchronous events over direct method calls between modules
- Events represent "something happened" rather than "do something"

### 4. Hide Implementation Details
- Use `internal` packages for implementation
- Only expose necessary APIs in the module root

### 5. Document Module Boundaries
- Use `@ApplicationModule` annotations
- Generate and review architecture documentation regularly

### 6. Test Module Isolation
- Use `@ApplicationModuleTest` to test modules in isolation
- Verify architectural rules with tests

---

## Migration Strategy

### From Traditional Spring Boot to Spring Modulith

1. **Identify Domain Boundaries**: Analyze your application and identify logical modules
2. **Reorganize Packages**: Move code into module-based package structure
3. **Extract Internal Packages**: Move implementation details to `internal` packages
4. **Replace Direct Calls with Events**: Convert synchronous calls to event-based communication
5. **Add Verification Tests**: Create tests to verify module structure
6. **Generate Documentation**: Document your new architecture

### Example Refactoring

**Before:**
```
com.example.app/
├── controller/
├── service/
├── repository/
└── model/
```

**After:**
```
com.example.app/
├── order/
│   ├── Order.java
│   ├── OrderService.java
│   └── internal/
├── customer/
│   ├── Customer.java
│   ├── CustomerService.java
│   └── internal/
└── inventory/
    ├── Product.java
    ├── InventoryService.java
    └── internal/
```

---

## Common Patterns

### 1. Shared Kernel

Create a `common` or `shared` module for cross-cutting concerns:

```java
package com.example.ecommerce.common;

public record Money(BigDecimal amount, Currency currency) {
}
```

### 2. Open Host Service

Expose a module's functionality via REST API:

```java
package com.example.ecommerce.order.api;

@RestController
@RequestMapping("/api/orders")
public class OrderApiController {

    private final OrderService orderService;

    // Expose order functionality to external clients
}
```

### 3. Anti-Corruption Layer

Protect your domain from external dependencies:

```java
package com.example.ecommerce.payment.internal;

@Component
class PaymentGatewayAdapter {
    // Translate between domain model and external payment API
}
```

---

## Troubleshooting

### Module Dependency Violations

**Error:**
```
Module 'inventory' depends on non-exposed type 'OrderRepository' from module 'order'
```

**Solution:** Move `OrderRepository` to `internal` package and expose only necessary APIs.

### Circular Dependencies

**Error:**
```
Cycle detected: order -> inventory -> order
```

**Solution:** Introduce events to break the cycle or restructure modules.

### Events Not Delivered

**Issue:** Events are published but not received.

**Solution:**
- Ensure event listeners are in the correct package structure
- Check that `@ApplicationModuleListener` is used
- Verify Spring context is properly configured

---

## Real-World Example: E-Commerce Platform

Complete module structure:

```
com.example.ecommerce/
├── EcommerceApplication.java
├── order/
│   ├── Order.java
│   ├── OrderService.java
│   ├── OrderPlacedEvent.java
│   ├── OrderCompletedEvent.java
│   └── internal/
│       ├── OrderRepository.java
│       ├── OrderController.java
│       └── OrderManagement.java
├── customer/
│   ├── Customer.java
│   ├── CustomerService.java
│   └── internal/
│       ├── CustomerRepository.java
│       └── CustomerController.java
├── inventory/
│   ├── Product.java
│   ├── InventoryService.java
│   └── internal/
│       ├── InventoryRepository.java
│       ├── InventoryController.java
│       └── InventoryEventListener.java
├── payment/
│   ├── Payment.java
│   ├── PaymentService.java
│   ├── PaymentCompletedEvent.java
│   └── internal/
│       ├── PaymentRepository.java
│       └── PaymentGatewayAdapter.java
└── notification/
    ├── NotificationService.java
    └── internal/
        ├── EmailService.java
        └── NotificationEventListener.java
```

---

## Resources

### Official Documentation
- [Spring Modulith Reference](https://docs.spring.io/spring-modulith/reference/)
- [Spring Modulith GitHub](https://github.com/spring-projects/spring-modulith)

### Related Concepts
- Domain-Driven Design (DDD)
- Hexagonal Architecture
- Event-Driven Architecture
- Microservices Architecture

### Tools
- [ArchUnit](https://www.archunit.org/) - Architecture testing
- [jMolecules](https://github.com/xmolecules/jmolecules) - DDD building blocks
- [PlantUML](https://plantuml.com/) - Diagram generation

---

## Summary

Spring Modulith provides a powerful framework for building modular Spring Boot applications:

1. **Module Structure**: Organize code into logical, bounded modules
2. **Boundary Enforcement**: Automatically verify architectural rules
3. **Event-Driven Communication**: Enable loose coupling through application events
4. **Documentation**: Auto-generate up-to-date architecture documentation
5. **Testing**: Test modules in isolation with dedicated testing support
6. **Observability**: Built-in monitoring and tracing capabilities
7. **Migration Path**: Clear path from monolith to microservices

By adopting Spring Modulith, you can build maintainable, well-structured applications that are easier to understand, test, and evolve over time.

---

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).