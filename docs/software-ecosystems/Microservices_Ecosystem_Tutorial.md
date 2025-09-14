# Microservices Ecosystem Tutorial

## Introduction

Microservices architecture is an approach to building applications as a suite of small, independently deployable services that communicate over well-defined APIs. This tutorial explores a complete microservices ecosystem with service discovery, API gateway, distributed tracing, and container orchestration.

## Overview

This tutorial demonstrates building a comprehensive e-commerce platform using microservices architecture, showcasing how different services work together to create a scalable, maintainable system.

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Applications                         │
├─────────────────┬──────────────────┬──────────────────────────┤
│   Web App       │   Mobile App     │   Admin Dashboard       │
│   (React)       │   (React Native) │   (Vue.js)              │
└─────────────────┴──────────────────┴──────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                      API Gateway                               │
│                    (Kong/Zuul)                                │
└─────────────────────────────┼─────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                  Service Discovery                             │
│                    (Consul/Eureka)                            │
└─────────────────────────────┼─────────────────────────────────┘
                              │
├───────────────┬──────────────┼──────────────┬─────────────────┤
│ User Service  │ Product      │ Order        │ Payment Service │
│ (Node.js)     │ Service      │ Service      │ (Go)            │
│               │ (Java)       │ (Python)     │                 │
├───────────────┼──────────────┼──────────────┼─────────────────┤
│ MongoDB       │ PostgreSQL   │ Redis        │ PostgreSQL      │
└───────────────┴──────────────┴──────────────┴─────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                  Message Queue                                │
│                   (RabbitMQ/Kafka)                           │
└─────────────────────────────┼─────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│               Observability Stack                             │
│   Monitoring    │   Logging    │   Distributed Tracing       │
│   (Prometheus)  │   (ELK)      │   (Jaeger)                 │
└─────────────────────────────┼─────────────────────────────────┘
```

## Service Infrastructure Setup

### Docker Compose Infrastructure

```yaml
# docker-compose.infrastructure.yml
version: '3.8'

networks:
  microservices:
    driver: bridge

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
  rabbitmq_data:
  consul_data:
  elasticsearch_data:

services:
  # Service Discovery
  consul:
    image: consul:1.15
    container_name: consul
    command: consul agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0
    ports:
      - "8500:8500"
    volumes:
      - consul_data:/consul/data
    networks:
      - microservices

  # API Gateway
  kong:
    image: kong:3.4
    container_name: kong
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/declarative/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
    volumes:
      - ./kong/kong.yml:/kong/declarative/kong.yml
    ports:
      - "8000:8000"
      - "8443:8443"
      - "8001:8001"
      - "8444:8444"
    networks:
      - microservices

  # Databases
  postgres:
    image: postgres:15
    container_name: postgres
    environment:
      POSTGRES_DB: microservices
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - microservices

  mongodb:
    image: mongo:6.0
    container_name: mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - microservices

  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - microservices

  # Message Queue
  rabbitmq:
    image: rabbitmq:3.12-management
    container_name: rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - microservices

  # Monitoring & Observability
  prometheus:
    image: prom/prometheus:v2.47.0
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    networks:
      - microservices

  grafana:
    image: grafana/grafana:10.1.0
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    networks:
      - microservices

  jaeger:
    image: jaegertracing/all-in-one:1.49
    container_name: jaeger
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      COLLECTOR_OTLP_ENABLED: true
    networks:
      - microservices

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.9.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - microservices

  kibana:
    image: docker.elastic.co/kibana/kibana:8.9.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - microservices
```

## User Service (Node.js/Express)

### Service Implementation

```typescript
// user-service/src/app.ts
import express from 'express';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import amqp from 'amqplib';
import { register as consulRegister } from './utils/consul';
import { initializeTracing } from './utils/tracing';
import { setupMetrics } from './utils/metrics';
import userRoutes from './routes/users';
import authRoutes from './routes/auth';

const app = express();

// Initialize tracing
initializeTracing('user-service');

// Setup metrics
setupMetrics(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    version: process.env.SERVICE_VERSION || '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

class UserService {
  private redisClient: any;
  private rabbitmqConnection: amqp.Connection | null = null;

  async initialize() {
    try {
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGODB_URL || 'mongodb://admin:admin123@localhost:27017/users?authSource=admin');
      console.log('Connected to MongoDB');

      // Connect to Redis
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      await this.redisClient.connect();
      console.log('Connected to Redis');

      // Connect to RabbitMQ
      this.rabbitmqConnection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672');
      console.log('Connected to RabbitMQ');

      // Register with Consul
      await consulRegister('user-service', {
        port: parseInt(process.env.PORT || '3001'),
        healthCheck: '/health'
      });

      console.log('User service registered with Consul');
    } catch (error) {
      console.error('Initialization error:', error);
      process.exit(1);
    }
  }

  async publishEvent(eventType: string, data: any) {
    if (this.rabbitmqConnection) {
      const channel = await this.rabbitmqConnection.createChannel();
      await channel.assertExchange('user.events', 'topic', { durable: true });

      const message = {
        eventType,
        data,
        timestamp: new Date().toISOString(),
        service: 'user-service'
      };

      await channel.publish('user.events', eventType, Buffer.from(JSON.stringify(message)));
      await channel.close();
    }
  }

  getRedisClient() {
    return this.redisClient;
  }
}

export const userService = new UserService();

// Make service instance available to routes
app.set('userService', userService);

export default app;
```

### User Model and Repository

```typescript
// user-service/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: Date,
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
```

```typescript
// user-service/src/repositories/UserRepository.ts
import { User, IUser } from '../models/User';
import { userService } from '../app';
import { trace } from '../utils/tracing';

export class UserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    const span = trace.getTracer('user-service').startSpan('UserRepository.create');

    try {
      const user = new User(userData);
      await user.save();

      // Cache user data
      const redis = userService.getRedisClient();
      await redis.setex(`user:${user._id}`, 3600, JSON.stringify(user.toObject()));

      // Publish user created event
      await userService.publishEvent('user.created', {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });

      span.setAttributes({
        'user.id': user._id.toString(),
        'user.email': user.email
      });

      return user;
    } catch (error) {
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  async findById(userId: string): Promise<IUser | null> {
    const span = trace.getTracer('user-service').startSpan('UserRepository.findById');

    try {
      // Try cache first
      const redis = userService.getRedisClient();
      const cached = await redis.get(`user:${userId}`);

      if (cached) {
        span.setAttributes({ 'cache.hit': true });
        return JSON.parse(cached);
      }

      const user = await User.findById(userId).lean();

      if (user) {
        // Cache for future requests
        await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
        span.setAttributes({ 'cache.hit': false, 'cache.set': true });
      }

      return user;
    } catch (error) {
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async update(userId: string, updates: Partial<IUser>): Promise<IUser | null> {
    const span = trace.getTracer('user-service').startSpan('UserRepository.update');

    try {
      const user = await User.findByIdAndUpdate(userId, updates, { new: true });

      if (user) {
        // Update cache
        const redis = userService.getRedisClient();
        await redis.setex(`user:${userId}`, 3600, JSON.stringify(user.toObject()));

        // Publish user updated event
        await userService.publishEvent('user.updated', {
          userId: user._id,
          changes: Object.keys(updates)
        });
      }

      return user;
    } catch (error) {
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  async delete(userId: string): Promise<boolean> {
    const span = trace.getTracer('user-service').startSpan('UserRepository.delete');

    try {
      const result = await User.findByIdAndDelete(userId);

      if (result) {
        // Remove from cache
        const redis = userService.getRedisClient();
        await redis.del(`user:${userId}`);

        // Publish user deleted event
        await userService.publishEvent('user.deleted', { userId });
      }

      return !!result;
    } catch (error) {
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  async list(page = 1, limit = 20, filters: any = {}): Promise<{ users: IUser[], total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filters).skip(skip).limit(limit).lean(),
      User.countDocuments(filters)
    ]);

    return { users, total };
  }
}
```

### Authentication Controller

```typescript
// user-service/src/controllers/AuthController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { ValidationError, AuthenticationError } from '../utils/errors';

export class AuthController {
  private userRepository = new UserRepository();

  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validation
      if (!email || !password || !firstName || !lastName) {
        throw new ValidationError('All fields are required');
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          code: 'USER_EXISTS'
        });
      }

      // Create user
      const user = await this.userRepository.create({
        email,
        password,
        firstName,
        lastName
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: 'user'
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: 'user'
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        return res.status(401).json({ error: error.message });
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ValidationError('Refresh token is required');
      }

      // Verify the token (ignoring expiration)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret', {
        ignoreExpiration: true
      }) as any;

      // Generate new token
      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Token refreshed',
        token: newToken
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  async logout(req: Request, res: Response) {
    // In a real implementation, you might want to blacklist the token
    res.json({ message: 'Logout successful' });
  }
}
```

## Product Service (Java/Spring Boot)

### Spring Boot Configuration

```java
// product-service/src/main/java/com/microservices/product/ProductServiceApplication.java
package com.microservices.product;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaRepositories
@EnableCaching
@EnableAsync
@EnableTransactionManagement
public class ProductServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }
}
```

```yaml
# product-service/src/main/resources/application.yml
server:
  port: ${PORT:3002}

spring:
  application:
    name: product-service

  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:microservices}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    show-sql: false

  cache:
    type: redis

  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    timeout: 2000
    jedis:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0

  cloud:
    consul:
      host: ${CONSUL_HOST:localhost}
      port: ${CONSUL_PORT:8500}
      discovery:
        service-name: ${spring.application.name}
        health-check-path: /actuator/health
        health-check-interval: 15s
        tags:
          - version=${SERVICE_VERSION:1.0.0}
          - environment=${ENVIRONMENT:development}

  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USER:admin}
    password: ${RABBITMQ_PASSWORD:admin123}

logging:
  level:
    com.microservices.product: DEBUG
    org.springframework.cloud: INFO
    org.hibernate.SQL: INFO

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true

# Distributed tracing
opentracing:
  jaeger:
    service-name: ${spring.application.name}
    sampler:
      type: const
      param: 1
    sender:
      endpoint: ${JAEGER_ENDPOINT:http://localhost:14268/api/traces}
```

### Product Entity and Repository

```java
// product-service/src/main/java/com/microservices/product/entity/Product.java
package com.microservices.product.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@EqualsAndHashCode(exclude = {"images", "reviews"})
@ToString(exclude = {"images", "reviews"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Size(max = 2000)
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String category;

    @Min(0)
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Size(max = 50)
    @Column(name = "brand")
    private String brand;

    @Size(max = 100)
    @Column(name = "sku", unique = true)
    private String sku;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "5.0")
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Min(0)
    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProductReview> reviews = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProduct(null);
    }

    public void addReview(ProductReview review) {
        reviews.add(review);
        review.setProduct(this);
        updateRatingMetrics();
    }

    public void removeReview(ProductReview review) {
        reviews.remove(review);
        review.setProduct(null);
        updateRatingMetrics();
    }

    private void updateRatingMetrics() {
        if (reviews.isEmpty()) {
            this.averageRating = BigDecimal.ZERO;
            this.reviewCount = 0;
        } else {
            this.reviewCount = reviews.size();
            double average = reviews.stream()
                    .mapToInt(ProductReview::getRating)
                    .average()
                    .orElse(0.0);
            this.averageRating = BigDecimal.valueOf(average);
        }
    }

    public boolean isInStock() {
        return stockQuantity != null && stockQuantity > 0;
    }

    public boolean isAvailable() {
        return active && isInStock();
    }
}
```

```java
// product-service/src/main/java/com/microservices/product/repository/ProductRepository.java
package com.microservices.product.repository;

import com.microservices.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySkuAndActiveTrue(String sku);

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:brand IS NULL OR p.brand = :brand) AND " +
           "(:searchTerm IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Product> findWithFilters(
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("brand") String brand,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.active = true ORDER BY p.category")
    List<String> findAllCategories();

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.active = true AND p.brand IS NOT NULL ORDER BY p.brand")
    List<String> findAllBrands();

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stockQuantity > 0 ORDER BY p.createdAt DESC")
    Page<Product> findLatestInStock(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.averageRating DESC, p.reviewCount DESC")
    Page<Product> findTopRated(Pageable pageable);

    List<Product> findByIdInAndActiveTrue(List<Long> ids);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true AND p.stockQuantity > 0")
    long countActiveInStockProducts();
}
```

### Product Service Layer

```java
// product-service/src/main/java/com/microservices/product/service/ProductService.java
package com.microservices.product.service;

import com.microservices.product.dto.ProductDTO;
import com.microservices.product.dto.ProductCreateRequest;
import com.microservices.product.dto.ProductUpdateRequest;
import com.microservices.product.entity.Product;
import com.microservices.product.exception.ProductNotFoundException;
import com.microservices.product.exception.InsufficientStockException;
import com.microservices.product.mapper.ProductMapper;
import com.microservices.product.repository.ProductRepository;
import com.microservices.product.messaging.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.opentracing.Span;
import io.opentracing.Tracer;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final EventPublisher eventPublisher;
    private final Tracer tracer;

    @Cacheable(value = "products", key = "#id")
    public ProductDTO getProductById(Long id) {
        Span span = tracer.nextSpan().name("ProductService.getProductById")
                .tag("product.id", String.valueOf(id));

        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span)) {
            log.debug("Fetching product with id: {}", id);

            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

            return productMapper.toDTO(product);
        } finally {
            span.end();
        }
    }

    @Cacheable(value = "productsBySku", key = "#sku")
    public ProductDTO getProductBySku(String sku) {
        log.debug("Fetching product with sku: {}", sku);

        Product product = productRepository.findBySkuAndActiveTrue(sku)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with sku: " + sku));

        return productMapper.toDTO(product);
    }

    public Page<ProductDTO> getProducts(Pageable pageable) {
        log.debug("Fetching products with pageable: {}", pageable);

        Page<Product> products = productRepository.findByActiveTrue(pageable);
        return products.map(productMapper::toDTO);
    }

    public Page<ProductDTO> searchProducts(
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String brand,
            String searchTerm,
            Pageable pageable) {

        Span span = tracer.nextSpan().name("ProductService.searchProducts")
                .tag("search.category", category)
                .tag("search.term", searchTerm);

        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span)) {
            log.debug("Searching products with filters - category: {}, minPrice: {}, maxPrice: {}, brand: {}, searchTerm: {}",
                     category, minPrice, maxPrice, brand, searchTerm);

            Page<Product> products = productRepository.findWithFilters(
                    category, minPrice, maxPrice, brand, searchTerm, pageable);

            return products.map(productMapper::toDTO);
        } finally {
            span.end();
        }
    }

    @Transactional
    @CacheEvict(value = {"products", "productsBySku"}, allEntries = true)
    public ProductDTO createProduct(ProductCreateRequest request) {
        log.debug("Creating new product: {}", request.getName());

        Product product = productMapper.toEntity(request);
        product = productRepository.save(product);

        // Publish product created event
        eventPublisher.publishProductCreated(product);

        return productMapper.toDTO(product);
    }

    @Transactional
    @CacheEvict(value = {"products", "productsBySku"}, key = "#id")
    public ProductDTO updateProduct(Long id, ProductUpdateRequest request) {
        log.debug("Updating product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        productMapper.updateEntity(product, request);
        product = productRepository.save(product);

        // Publish product updated event
        eventPublisher.publishProductUpdated(product);

        return productMapper.toDTO(product);
    }

    @Transactional
    @CacheEvict(value = {"products", "productsBySku"}, key = "#id")
    public void deleteProduct(Long id) {
        log.debug("Deleting product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        product.setActive(false);
        productRepository.save(product);

        // Publish product deleted event
        eventPublisher.publishProductDeleted(product);
    }

    @Transactional
    public void updateStock(Long productId, int quantity) {
        Span span = tracer.nextSpan().name("ProductService.updateStock")
                .tag("product.id", String.valueOf(productId))
                .tag("stock.quantity", String.valueOf(quantity));

        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span)) {
            log.debug("Updating stock for product {} by {}", productId, quantity);

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));

            int newStock = product.getStockQuantity() + quantity;
            if (newStock < 0) {
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
            }

            product.setStockQuantity(newStock);
            productRepository.save(product);

            // Publish stock updated event
            eventPublisher.publishStockUpdated(product, quantity);

            // Clear cache
            evictProductFromCache(productId);
        } finally {
            span.end();
        }
    }

    public boolean checkStock(Long productId, int requiredQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));

        return product.getStockQuantity() >= requiredQuantity;
    }

    public List<ProductDTO> getProductsByIds(List<Long> productIds) {
        log.debug("Fetching products by ids: {}", productIds);

        List<Product> products = productRepository.findByIdInAndActiveTrue(productIds);
        return productMapper.toDTOList(products);
    }

    public List<String> getAllCategories() {
        return productRepository.findAllCategories();
    }

    public List<String> getAllBrands() {
        return productRepository.findAllBrands();
    }

    @CacheEvict(value = {"products", "productsBySku"}, key = "#productId")
    private void evictProductFromCache(Long productId) {
        log.debug("Evicting product from cache: {}", productId);
    }
}
```

## Order Service (Python/FastAPI)

### FastAPI Application Setup

```python
# order-service/app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import asyncio
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.database import init_db
from app.core.consul import ConsulClient
from app.core.redis_client import RedisClient
from app.core.messaging import MessageBroker
from app.core.logging import setup_logging
from app.api import orders, health
from app.core.middleware import RequestLoggingMiddleware, TracingMiddleware
from app.core.metrics import setup_metrics

settings = get_settings()
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await RedisClient.initialize()
    await MessageBroker.initialize()

    # Register with Consul
    consul_client = ConsulClient()
    await consul_client.register_service(
        name="order-service",
        port=settings.PORT,
        health_check_url=f"http://localhost:{settings.PORT}/health"
    )

    yield

    # Shutdown
    await RedisClient.close()
    await MessageBroker.close()
    await consul_client.deregister_service("order-service")

app = FastAPI(
    title="Order Service",
    description="Microservice for managing orders",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(TracingMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Setup metrics
setup_metrics(app)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_config=None  # We handle logging ourselves
    )
```

### Order Models and Schemas

```python
# order-service/app/models/order.py
from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
import uuid

from app.core.database import Base

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Order details
    status = Column(String(20), default=OrderStatus.PENDING, nullable=False)
    payment_status = Column(String(20), default=PaymentStatus.PENDING, nullable=False)

    # Amounts
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0)
    shipping_amount = Column(Numeric(10, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)

    # Customer information
    customer_info = Column(JSONB)
    shipping_address = Column(JSONB, nullable=False)
    billing_address = Column(JSONB)

    # Additional data
    notes = Column(Text)
    metadata = Column(JSONB)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))

    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)

    # Product details (snapshot at time of order)
    product_id = Column(Integer, nullable=False)
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100))
    product_description = Column(Text)

    # Pricing
    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)

    # Product snapshot
    product_snapshot = Column(JSONB)

    # Relationships
    order = relationship("Order", back_populates="items")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)

    # Payment details
    payment_method = Column(String(50), nullable=False)
    payment_provider = Column(String(50))
    provider_transaction_id = Column(String(255))

    # Amount
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD")

    # Status
    status = Column(String(20), default=PaymentStatus.PENDING)

    # Additional data
    provider_response = Column(JSONB)
    failure_reason = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))

    # Relationships
    order = relationship("Order", back_populates="payments")
```

```python
# order-service/app/schemas/order.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum

from app.models.order import OrderStatus, PaymentStatus

class AddressSchema(BaseModel):
    street: str
    city: str
    state: str
    postal_code: str
    country: str
    apartment: Optional[str] = None

class CustomerInfoSchema(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)
    unit_price: Optional[Decimal] = None

class OrderItemResponse(BaseModel):
    id: str
    product_id: int
    product_name: str
    product_sku: Optional[str]
    unit_price: Decimal
    quantity: int
    total_price: Decimal

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    user_id: str
    items: List[OrderItemCreate]
    shipping_address: AddressSchema
    billing_address: Optional[AddressSchema] = None
    customer_info: CustomerInfoSchema
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    @validator('items')
    def items_must_not_be_empty(cls, v):
        if not v:
            raise ValueError('Order must contain at least one item')
        return v

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    shipping_address: Optional[AddressSchema] = None
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PaymentCreate(BaseModel):
    payment_method: str
    payment_provider: Optional[str] = None
    amount: Optional[Decimal] = None  # If None, uses order total
    currency: str = "USD"

class PaymentResponse(BaseModel):
    id: str
    payment_method: str
    amount: Decimal
    currency: str
    status: PaymentStatus
    created_at: datetime
    processed_at: Optional[datetime]

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    order_number: str
    user_id: str
    status: OrderStatus
    payment_status: PaymentStatus
    subtotal: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    customer_info: CustomerInfoSchema
    shipping_address: AddressSchema
    billing_address: Optional[AddressSchema]
    items: List[OrderItemResponse]
    payments: List[PaymentResponse]
    notes: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]

    class Config:
        from_attributes = True

class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    pages: int
    per_page: int
```

### Order Service Implementation

```python
# order-service/app/services/order_service.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
import httpx
import asyncio
from decimal import Decimal
import logging

from app.models.order import Order, OrderItem, Payment, OrderStatus, PaymentStatus
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse
from app.core.database import get_db
from app.core.redis_client import RedisClient
from app.core.messaging import MessageBroker
from app.services.external_services import ProductService, UserService, PaymentService
from app.core.tracing import trace_function
from app.utils.order_utils import generate_order_number

logger = logging.getLogger(__name__)

class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.product_service = ProductService()
        self.user_service = UserService()
        self.payment_service = PaymentService()

    @trace_function
    async def create_order(self, order_data: OrderCreate) -> OrderResponse:
        """Create a new order"""

        # Validate user exists
        user = await self.user_service.get_user(order_data.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Validate products and get current prices
        product_ids = [item.product_id for item in order_data.items]
        products = await self.product_service.get_products_by_ids(product_ids)

        if len(products) != len(product_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Some products not found"
            )

        # Check stock availability
        stock_check_tasks = [
            self.product_service.check_stock(item.product_id, item.quantity)
            for item in order_data.items
        ]
        stock_results = await asyncio.gather(*stock_check_tasks)

        if not all(stock_results):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock for some items"
            )

        # Calculate order totals
        subtotal = Decimal('0')
        order_items = []

        products_dict = {p['id']: p for p in products}

        for item_data in order_data.items:
            product = products_dict[item_data.product_id]
            unit_price = Decimal(str(product['price']))
            total_price = unit_price * item_data.quantity
            subtotal += total_price

            order_item = OrderItem(
                product_id=item_data.product_id,
                product_name=product['name'],
                product_sku=product.get('sku'),
                product_description=product.get('description'),
                unit_price=unit_price,
                quantity=item_data.quantity,
                total_price=total_price,
                product_snapshot=product
            )
            order_items.append(order_item)

        # Calculate tax and shipping
        tax_amount = await self._calculate_tax(subtotal, order_data.shipping_address)
        shipping_amount = await self._calculate_shipping(order_data.shipping_address, order_items)
        total_amount = subtotal + tax_amount + shipping_amount

        # Create order
        order = Order(
            order_number=generate_order_number(),
            user_id=order_data.user_id,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_amount=shipping_amount,
            total_amount=total_amount,
            customer_info=order_data.customer_info.dict(),
            shipping_address=order_data.shipping_address.dict(),
            billing_address=order_data.billing_address.dict() if order_data.billing_address else None,
            notes=order_data.notes,
            metadata=order_data.metadata,
            items=order_items
        )

        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)

        # Reserve stock
        reserve_tasks = [
            self.product_service.reserve_stock(item.product_id, item.quantity)
            for item in order_data.items
        ]
        await asyncio.gather(*reserve_tasks)

        # Cache order
        await self._cache_order(order)

        # Publish order created event
        await MessageBroker.publish(
            exchange='order.events',
            routing_key='order.created',
            message={
                'order_id': str(order.id),
                'user_id': order.user_id,
                'total_amount': float(order.total_amount),
                'items_count': len(order.items),
                'timestamp': order.created_at.isoformat()
            }
        )

        logger.info(f"Order created: {order.order_number}")
        return OrderResponse.from_orm(order)

    @trace_function
    async def get_order(self, order_id: str) -> Optional[OrderResponse]:
        """Get order by ID"""

        # Try cache first
        cached_order = await self._get_cached_order(order_id)
        if cached_order:
            return cached_order

        # Query database
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return None

        # Cache for future requests
        await self._cache_order(order)

        return OrderResponse.from_orm(order)

    @trace_function
    async def update_order(self, order_id: str, order_update: OrderUpdate) -> OrderResponse:
        """Update order"""

        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # Update fields
        if order_update.status is not None:
            await self._validate_status_transition(order.status, order_update.status)
            order.status = order_update.status

        if order_update.shipping_address is not None:
            order.shipping_address = order_update.shipping_address.dict()

        if order_update.notes is not None:
            order.notes = order_update.notes

        if order_update.metadata is not None:
            order.metadata = order_update.metadata

        self.db.commit()
        self.db.refresh(order)

        # Clear cache
        await self._clear_order_cache(order_id)

        # Publish order updated event
        await MessageBroker.publish(
            exchange='order.events',
            routing_key='order.updated',
            message={
                'order_id': str(order.id),
                'status': order.status,
                'timestamp': order.updated_at.isoformat()
            }
        )

        return OrderResponse.from_orm(order)

    async def cancel_order(self, order_id: str, reason: str = None) -> OrderResponse:
        """Cancel order"""

        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        if order.status not in [OrderStatus.PENDING, OrderStatus.CONFIRMED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order cannot be cancelled"
            )

        order.status = OrderStatus.CANCELLED
        if reason:
            order.notes = f"{order.notes or ''}\nCancellation reason: {reason}"

        self.db.commit()
        self.db.refresh(order)

        # Release reserved stock
        release_tasks = [
            self.product_service.release_stock(item.product_id, item.quantity)
            for item in order.items
        ]
        await asyncio.gather(*release_tasks)

        # Process refunds if payment was completed
        if order.payment_status == PaymentStatus.COMPLETED:
            await self.payment_service.refund_payment(order.id)

        # Clear cache
        await self._clear_order_cache(order_id)

        # Publish order cancelled event
        await MessageBroker.publish(
            exchange='order.events',
            routing_key='order.cancelled',
            message={
                'order_id': str(order.id),
                'reason': reason,
                'timestamp': order.updated_at.isoformat()
            }
        )

        return OrderResponse.from_orm(order)

    async def _calculate_tax(self, subtotal: Decimal, shipping_address: dict) -> Decimal:
        """Calculate tax amount"""
        # Simplified tax calculation - in reality, this would use a tax service
        tax_rate = Decimal('0.08')  # 8% tax rate
        return subtotal * tax_rate

    async def _calculate_shipping(self, shipping_address: dict, items: List[OrderItem]) -> Decimal:
        """Calculate shipping amount"""
        # Simplified shipping calculation
        base_shipping = Decimal('9.99')

        # Free shipping over $100
        total_value = sum(item.total_price for item in items)
        if total_value >= Decimal('100'):
            return Decimal('0')

        return base_shipping

    async def _validate_status_transition(self, current_status: str, new_status: str):
        """Validate status transition"""
        valid_transitions = {
            OrderStatus.PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            OrderStatus.CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
            OrderStatus.PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
            OrderStatus.SHIPPED: [OrderStatus.DELIVERED],
            OrderStatus.DELIVERED: [],
            OrderStatus.CANCELLED: []
        }

        if new_status not in valid_transitions.get(current_status, []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition from {current_status} to {new_status}"
            )

    async def _cache_order(self, order: Order):
        """Cache order data"""
        cache_key = f"order:{order.id}"
        order_data = OrderResponse.from_orm(order).dict()
        await RedisClient.setex(cache_key, 3600, order_data)

    async def _get_cached_order(self, order_id: str) -> Optional[OrderResponse]:
        """Get order from cache"""
        cache_key = f"order:{order_id}"
        cached_data = await RedisClient.get(cache_key)

        if cached_data:
            return OrderResponse.parse_obj(cached_data)
        return None

    async def _clear_order_cache(self, order_id: str):
        """Clear order from cache"""
        cache_key = f"order:{order_id}"
        await RedisClient.delete(cache_key)
```

## Payment Service (Go)

### Go Service Structure

```go
// payment-service/main.go
package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/microservices/payment-service/internal/config"
    "github.com/microservices/payment-service/internal/database"
    "github.com/microservices/payment-service/internal/handlers"
    "github.com/microservices/payment-service/internal/middleware"
    "github.com/microservices/payment-service/internal/services"
    "github.com/microservices/payment-service/pkg/consul"
    "github.com/microservices/payment-service/pkg/messaging"
    "github.com/microservices/payment-service/pkg/metrics"
    "github.com/microservices/payment-service/pkg/tracing"
)

func main() {
    // Load configuration
    cfg := config.Load()

    // Initialize tracing
    tracer, closer, err := tracing.Init("payment-service", cfg.JaegerEndpoint)
    if err != nil {
        log.Fatalf("Failed to initialize tracing: %v", err)
    }
    defer closer.Close()

    // Initialize database
    db, err := database.Connect(cfg.DatabaseURL)
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    defer database.Close(db)

    // Run migrations
    if err := database.Migrate(db); err != nil {
        log.Fatalf("Failed to run migrations: %v", err)
    }

    // Initialize messaging
    messageBroker, err := messaging.NewRabbitMQBroker(cfg.RabbitMQURL)
    if err != nil {
        log.Fatalf("Failed to initialize message broker: %v", err)
    }
    defer messageBroker.Close()

    // Initialize services
    paymentService := services.NewPaymentService(db, messageBroker, tracer)
    stripeService := services.NewStripeService(cfg.StripeSecretKey)

    // Initialize handlers
    handler := handlers.NewPaymentHandler(paymentService, stripeService, tracer)

    // Setup Gin router
    router := gin.New()
    router.Use(gin.Recovery())
    router.Use(middleware.RequestLogging())
    router.Use(middleware.CORS())
    router.Use(middleware.Tracing(tracer))

    // Setup routes
    setupRoutes(router, handler)

    // Setup metrics
    metrics.Setup(router)

    // Register with Consul
    consulClient := consul.NewClient(cfg.ConsulAddress)
    serviceID := fmt.Sprintf("payment-service-%d", cfg.Port)

    err = consulClient.Register(consul.ServiceRegistration{
        ID:      serviceID,
        Name:    "payment-service",
        Address: "localhost",
        Port:    cfg.Port,
        Tags:    []string{"api", "payments"},
        Check: consul.HealthCheck{
            HTTP:                           fmt.Sprintf("http://localhost:%d/health", cfg.Port),
            Interval:                       "10s",
            Timeout:                        "3s",
            DeregisterCriticalServiceAfter: "30s",
        },
    })
    if err != nil {
        log.Fatalf("Failed to register with Consul: %v", err)
    }
    defer consulClient.Deregister(serviceID)

    // Start HTTP server
    srv := &http.Server{
        Addr:    fmt.Sprintf(":%d", cfg.Port),
        Handler: router,
    }

    go func() {
        log.Printf("Payment service starting on port %d", cfg.Port)
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server failed to start: %v", err)
        }
    }()

    // Wait for interrupt signal
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    log.Println("Shutting down server...")

    // Graceful shutdown
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal("Server forced to shutdown:", err)
    }

    log.Println("Server exited")
}

func setupRoutes(router *gin.Engine, handler *handlers.PaymentHandler) {
    // Health check
    router.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":    "healthy",
            "service":   "payment-service",
            "timestamp": time.Now().Format(time.RFC3339),
            "version":   "1.0.0",
        })
    })

    // API routes
    api := router.Group("/api")
    {
        payments := api.Group("/payments")
        {
            payments.POST("/", handler.CreatePayment)
            payments.GET("/:id", handler.GetPayment)
            payments.PUT("/:id/confirm", handler.ConfirmPayment)
            payments.POST("/:id/refund", handler.RefundPayment)
            payments.GET("/order/:orderId", handler.GetPaymentsByOrderID)
        }

        // Stripe webhook
        api.POST("/webhooks/stripe", handler.StripeWebhook)
    }
}
```

### Payment Models and Services

```go
// payment-service/internal/models/payment.go
package models

import (
    "database/sql/driver"
    "encoding/json"
    "fmt"
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type PaymentStatus string
type PaymentMethod string

const (
    PaymentStatusPending   PaymentStatus = "pending"
    PaymentStatusProcessing PaymentStatus = "processing"
    PaymentStatusCompleted PaymentStatus = "completed"
    PaymentStatusFailed    PaymentStatus = "failed"
    PaymentStatusRefunded  PaymentStatus = "refunded"
    PaymentStatusCancelled PaymentStatus = "cancelled"
)

const (
    PaymentMethodCard   PaymentMethod = "card"
    PaymentMethodPayPal PaymentMethod = "paypal"
    PaymentMethodApplePay PaymentMethod = "apple_pay"
    PaymentMethodGooglePay PaymentMethod = "google_pay"
)

type PaymentMetadata map[string]interface{}

func (pm PaymentMetadata) Value() (driver.Value, error) {
    return json.Marshal(pm)
}

func (pm *PaymentMetadata) Scan(value interface{}) error {
    if value == nil {
        *pm = make(PaymentMetadata)
        return nil
    }

    bytes, ok := value.([]byte)
    if !ok {
        return fmt.Errorf("cannot scan %T into PaymentMetadata", value)
    }

    return json.Unmarshal(bytes, pm)
}

type Payment struct {
    ID                    uuid.UUID       `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
    OrderID               uuid.UUID       `json:"order_id" gorm:"type:uuid;not null;index"`
    UserID                uuid.UUID       `json:"user_id" gorm:"type:uuid;not null;index"`
    Amount                float64         `json:"amount" gorm:"not null"`
    Currency              string          `json:"currency" gorm:"default:USD;not null"`
    Status                PaymentStatus   `json:"status" gorm:"default:pending;not null"`
    Method                PaymentMethod   `json:"method" gorm:"not null"`
    Provider              string          `json:"provider" gorm:"not null"`
    ProviderTransactionID string          `json:"provider_transaction_id" gorm:"index"`
    Description           string          `json:"description"`
    FailureReason         string          `json:"failure_reason"`
    Metadata              PaymentMetadata `json:"metadata" gorm:"type:jsonb"`
    CreatedAt             time.Time       `json:"created_at"`
    UpdatedAt             time.Time       `json:"updated_at"`
    ProcessedAt           *time.Time      `json:"processed_at"`
    RefundedAt            *time.Time      `json:"refunded_at"`
}

type PaymentRequest struct {
    OrderID     uuid.UUID       `json:"order_id" binding:"required"`
    UserID      uuid.UUID       `json:"user_id" binding:"required"`
    Amount      float64         `json:"amount" binding:"required,min=0.01"`
    Currency    string          `json:"currency"`
    Method      PaymentMethod   `json:"method" binding:"required"`
    Provider    string          `json:"provider" binding:"required"`
    Description string          `json:"description"`
    Metadata    PaymentMetadata `json:"metadata"`
}

type PaymentResponse struct {
    Payment       *Payment `json:"payment"`
    ClientSecret  string   `json:"client_secret,omitempty"`
    RedirectURL   string   `json:"redirect_url,omitempty"`
    RequiresAction bool    `json:"requires_action"`
}

type RefundRequest struct {
    Amount float64 `json:"amount"`
    Reason string  `json:"reason"`
}

func (p *Payment) BeforeCreate(tx *gorm.DB) error {
    if p.ID == uuid.Nil {
        p.ID = uuid.New()
    }
    if p.Currency == "" {
        p.Currency = "USD"
    }
    return nil
}

func (p *Payment) CanBeRefunded() bool {
    return p.Status == PaymentStatusCompleted
}

func (p *Payment) CanBeCancelled() bool {
    return p.Status == PaymentStatusPending || p.Status == PaymentStatusProcessing
}
```

```go
// payment-service/internal/services/payment_service.go
package services

import (
    "context"
    "fmt"
    "time"

    "github.com/google/uuid"
    "github.com/opentracing/opentracing-go"
    "gorm.io/gorm"

    "github.com/microservices/payment-service/internal/models"
    "github.com/microservices/payment-service/pkg/messaging"
)

type PaymentService struct {
    db      *gorm.DB
    broker  messaging.MessageBroker
    tracer  opentracing.Tracer
}

func NewPaymentService(db *gorm.DB, broker messaging.MessageBroker, tracer opentracing.Tracer) *PaymentService {
    return &PaymentService{
        db:     db,
        broker: broker,
        tracer: tracer,
    }
}

func (s *PaymentService) CreatePayment(ctx context.Context, req *models.PaymentRequest) (*models.Payment, error) {
    span, ctx := opentracing.StartSpanFromContextWithTracer(ctx, s.tracer, "PaymentService.CreatePayment")
    defer span.Finish()

    span.SetTag("payment.order_id", req.OrderID.String())
    span.SetTag("payment.amount", req.Amount)
    span.SetTag("payment.method", string(req.Method))

    // Create payment record
    payment := &models.Payment{
        OrderID:     req.OrderID,
        UserID:      req.UserID,
        Amount:      req.Amount,
        Currency:    req.Currency,
        Status:      models.PaymentStatusPending,
        Method:      req.Method,
        Provider:    req.Provider,
        Description: req.Description,
        Metadata:    req.Metadata,
    }

    if err := s.db.Create(payment).Error; err != nil {
        span.LogFields(opentracing.Log{Key: "error", Value: err.Error()})
        return nil, fmt.Errorf("failed to create payment: %w", err)
    }

    // Publish payment created event
    if err := s.publishEvent("payment.created", map[string]interface{}{
        "payment_id": payment.ID.String(),
        "order_id":   payment.OrderID.String(),
        "user_id":    payment.UserID.String(),
        "amount":     payment.Amount,
        "currency":   payment.Currency,
        "method":     string(payment.Method),
        "status":     string(payment.Status),
        "timestamp":  payment.CreatedAt.Format(time.RFC3339),
    }); err != nil {
        // Log error but don't fail the request
        span.LogFields(opentracing.Log{Key: "event_publish_error", Value: err.Error()})
    }

    return payment, nil
}

func (s *PaymentService) GetPayment(ctx context.Context, paymentID uuid.UUID) (*models.Payment, error) {
    span, ctx := opentracing.StartSpanFromContextWithTracer(ctx, s.tracer, "PaymentService.GetPayment")
    defer span.Finish()

    span.SetTag("payment.id", paymentID.String())

    var payment models.Payment
    if err := s.db.First(&payment, "id = ?", paymentID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return nil, fmt.Errorf("payment not found")
        }
        return nil, fmt.Errorf("failed to get payment: %w", err)
    }

    return &payment, nil
}

func (s *PaymentService) GetPaymentsByOrderID(ctx context.Context, orderID uuid.UUID) ([]models.Payment, error) {
    span, ctx := opentracing.StartSpanFromContextWithTracer(ctx, s.tracer, "PaymentService.GetPaymentsByOrderID")
    defer span.Finish()

    span.SetTag("order.id", orderID.String())

    var payments []models.Payment
    if err := s.db.Where("order_id = ?", orderID).Find(&payments).Error; err != nil {
        return nil, fmt.Errorf("failed to get payments: %w", err)
    }

    return payments, nil
}

func (s *PaymentService) UpdatePaymentStatus(ctx context.Context, paymentID uuid.UUID, status models.PaymentStatus, providerTransactionID string, failureReason string) error {
    span, ctx := opentracing.StartSpanFromContextWithTracer(ctx, s.tracer, "PaymentService.UpdatePaymentStatus")
    defer span.Finish()

    span.SetTag("payment.id", paymentID.String())
    span.SetTag("payment.status", string(status))

    updates := map[string]interface{}{
        "status":     status,
        "updated_at": time.Now(),
    }

    if providerTransactionID != "" {
        updates["provider_transaction_id"] = providerTransactionID
    }

    if failureReason != "" {
        updates["failure_reason"] = failureReason
    }

    if status == models.PaymentStatusCompleted {
        updates["processed_at"] = time.Now()
    } else if status == models.PaymentStatusRefunded {
        updates["refunded_at"] = time.Now()
    }

    if err := s.db.Model(&models.Payment{}).Where("id = ?", paymentID).Updates(updates).Error; err != nil {
        return fmt.Errorf("failed to update payment status: %w", err)
    }

    // Get updated payment for event
    payment, err := s.GetPayment(ctx, paymentID)
    if err != nil {
        return err
    }

    // Publish payment status updated event
    eventType := fmt.Sprintf("payment.%s", string(status))
    if err := s.publishEvent(eventType, map[string]interface{}{
        "payment_id": payment.ID.String(),
        "order_id":   payment.OrderID.String(),
        "user_id":    payment.UserID.String(),
        "amount":     payment.Amount,
        "currency":   payment.Currency,
        "status":     string(payment.Status),
        "timestamp":  payment.UpdatedAt.Format(time.RFC3339),
    }); err != nil {
        span.LogFields(opentracing.Log{Key: "event_publish_error", Value: err.Error()})
    }

    return nil
}

func (s *PaymentService) RefundPayment(ctx context.Context, paymentID uuid.UUID, amount float64, reason string) error {
    span, ctx := opentracing.StartSpanFromContextWithTracer(ctx, s.tracer, "PaymentService.RefundPayment")
    defer span.Finish()

    span.SetTag("payment.id", paymentID.String())
    span.SetTag("refund.amount", amount)

    // Get payment
    payment, err := s.GetPayment(ctx, paymentID)
    if err != nil {
        return err
    }

    if !payment.CanBeRefunded() {
        return fmt.Errorf("payment cannot be refunded (status: %s)", string(payment.Status))
    }

    // Update payment status
    updates := map[string]interface{}{
        "status":      models.PaymentStatusRefunded,
        "updated_at":  time.Now(),
        "refunded_at": time.Now(),
    }

    if reason != "" {
        updates["failure_reason"] = fmt.Sprintf("Refunded: %s", reason)
    }

    if err := s.db.Model(payment).Updates(updates).Error; err != nil {
        return fmt.Errorf("failed to update payment for refund: %w", err)
    }

    // Publish refund event
    if err := s.publishEvent("payment.refunded", map[string]interface{}{
        "payment_id":   payment.ID.String(),
        "order_id":     payment.OrderID.String(),
        "user_id":      payment.UserID.String(),
        "amount":       payment.Amount,
        "refund_amount": amount,
        "reason":       reason,
        "timestamp":    time.Now().Format(time.RFC3339),
    }); err != nil {
        span.LogFields(opentracing.Log{Key: "event_publish_error", Value: err.Error()})
    }

    return nil
}

func (s *PaymentService) publishEvent(eventType string, data map[string]interface{}) error {
    message := messaging.Message{
        Type:      eventType,
        Data:      data,
        Timestamp: time.Now(),
        Service:   "payment-service",
    }

    return s.broker.Publish("payment.events", eventType, message)
}
```

## API Gateway Configuration

### Kong Gateway Setup

```yaml
# kong/kong.yml
_format_version: "3.0"
_transform: true

services:
  - name: user-service
    url: http://localhost:3001
    plugins:
      - name: prometheus
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
    routes:
      - name: user-routes
        paths:
          - /api/users
          - /api/auth
        strip_path: false

  - name: product-service
    url: http://localhost:3002
    plugins:
      - name: prometheus
      - name: rate-limiting
        config:
          minute: 200
          hour: 2000
    routes:
      - name: product-routes
        paths:
          - /api/products
        strip_path: false

  - name: order-service
    url: http://localhost:3003
    plugins:
      - name: prometheus
      - name: rate-limiting
        config:
          minute: 50
          hour: 500
    routes:
      - name: order-routes
        paths:
          - /api/orders
        strip_path: false

  - name: payment-service
    url: http://localhost:3004
    plugins:
      - name: prometheus
      - name: rate-limiting
        config:
          minute: 30
          hour: 300
    routes:
      - name: payment-routes
        paths:
          - /api/payments
        strip_path: false

plugins:
  - name: cors
    config:
      origins:
        - "*"
      methods:
        - GET
        - POST
        - PUT
        - DELETE
        - OPTIONS
      headers:
        - Accept
        - Accept-Version
        - Content-Length
        - Content-MD5
        - Content-Type
        - Date
        - X-Auth-Token
        - Authorization
      exposed_headers:
        - X-Auth-Token
      credentials: true
      max_age: 3600

  - name: request-id
    config:
      header_name: X-Request-ID
      echo_downstream: true

  - name: prometheus
    config:
      per_consumer: true
      status_code_metrics: true
      latency_metrics: true
      bandwidth_metrics: true
```

## Monitoring and Observability

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files: []

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'kong'
    static_configs:
      - targets: ['localhost:8001']
    metrics_path: /metrics

  - job_name: 'user-service'
    consul_sd_configs:
      - server: 'localhost:8500'
        services: ['user-service']
    metrics_path: /metrics
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: service
      - source_labels: [__meta_consul_node]
        target_label: node

  - job_name: 'product-service'
    consul_sd_configs:
      - server: 'localhost:8500'
        services: ['product-service']
    metrics_path: /actuator/prometheus
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: service

  - job_name: 'order-service'
    consul_sd_configs:
      - server: 'localhost:8500'
        services: ['order-service']
    metrics_path: /metrics
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: service

  - job_name: 'payment-service'
    consul_sd_configs:
      - server: 'localhost:8500'
        services: ['payment-service']
    metrics_path: /metrics
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: service
```

## Deployment and Orchestration

### Kubernetes Deployment

```yaml
# k8s/user-service-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        version: v1
    spec:
      containers:
      - name: user-service
        image: user-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: user-service-secrets
              key: mongodb-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: user-service-secrets
              key: redis-url
        - name: RABBITMQ_URL
          valueFrom:
            secretKeyRef:
              name: user-service-secrets
              key: rabbitmq-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: user-service-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - protocol: TCP
    port: 3001
    targetPort: 3001
  type: ClusterIP
```

## Testing Strategy

### Integration Tests

```javascript
// tests/integration/order-flow.test.js
const request = require('supertest');
const { setupTestEnvironment, teardownTestEnvironment } = require('./setup');

describe('Order Flow Integration Tests', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment(testEnv);
  });

  test('complete order flow', async () => {
    // 1. Create user
    const userResponse = await request(testEnv.apiGateway)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      })
      .expect(201);

    const { token, user } = userResponse.body;

    // 2. Get products
    const productsResponse = await request(testEnv.apiGateway)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const product = productsResponse.body.data[0];

    // 3. Create order
    const orderResponse = await request(testEnv.apiGateway)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: user.id,
        items: [{
          product_id: product.id,
          quantity: 2
        }],
        shipping_address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        },
        customer_info: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com'
        }
      })
      .expect(201);

    const order = orderResponse.body;

    // 4. Process payment
    const paymentResponse = await request(testEnv.apiGateway)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        order_id: order.id,
        user_id: user.id,
        amount: order.total_amount,
        method: 'card',
        provider: 'stripe'
      })
      .expect(201);

    // 5. Confirm payment (simulate webhook)
    await request(testEnv.paymentService)
      .put(`/api/payments/${paymentResponse.body.payment.id}/confirm`)
      .send({
        provider_transaction_id: 'txn_123456'
      })
      .expect(200);

    // 6. Verify order status updated
    const updatedOrderResponse = await request(testEnv.apiGateway)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(updatedOrderResponse.body.payment_status).toBe('completed');
  });
});
```

## Conclusion

This microservices ecosystem demonstrates a comprehensive approach to building scalable, maintainable distributed systems. Key architectural decisions include:

1. **Service Independence**: Each service has its own database and can be deployed independently
2. **Event-Driven Communication**: Services communicate through events to maintain loose coupling
3. **API Gateway**: Single entry point with cross-cutting concerns handled centrally
4. **Service Discovery**: Dynamic service registration and discovery with Consul
5. **Observability**: Comprehensive monitoring, logging, and distributed tracing
6. **Resilience**: Circuit breakers, retry mechanisms, and graceful degradation
7. **Security**: Authentication, authorization, and secure service-to-service communication

The ecosystem provides a solid foundation for building production-ready microservices applications that can scale with business requirements.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).