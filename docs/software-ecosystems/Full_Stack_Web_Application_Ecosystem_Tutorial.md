# Full Stack Web Application Ecosystem Tutorial

## Overview

This tutorial demonstrates building a complete software ecosystem from frontend to backend, including databases, caching, monitoring, and deployment. We'll create a modern e-commerce platform that showcases how different technologies work together in production.

## System Architecture Overview

![full-stack-web-app](full-stack-web-app.png)

## Frontend Ecosystem

### React Web Application

**Project Structure**:
```
frontend-web/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── product/
│   │   ├── user/
│   │   └── checkout/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
├── public/
├── tests/
└── docs/
```

**Core Application Setup**:

```typescript
// src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  preferences: UserPreferences;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
  images: string[];
  metadata: Record<string, any>;
}

export interface Order {
  id: string;
  userId: string;
  products: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}
```

```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiService {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth tokens
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiService = new ApiService(process.env.REACT_APP_API_URL || 'http://localhost:8080');
```

```typescript
// src/store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { apiService } from '../services/api';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.post<{
            user: User;
            token: string;
          }>('/auth/login', { email, password });

          localStorage.setItem('authToken', response.token);
          set({ user: response.user, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('authToken');
        set({ user: null, error: null });
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        set({ isLoading: true, error: null });
        try {
          const updatedUser = await apiService.put<User>(`/users/${user.id}`, updates);
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Update failed',
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

```typescript
// src/components/product/ProductList.tsx
import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { apiService } from '../../services/api';
import { ProductCard } from './ProductCard';
import { SearchBar } from '../common/SearchBar';
import { Pagination } from '../common/Pagination';

interface ProductListProps {
  category?: string;
}

export const ProductList: React.FC<ProductListProps> = ({ category }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [page, category, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(category && { category }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await apiService.get<{
        products: Product[];
        totalPages: number;
      }>(`/products?${params}`);

      setProducts(response.products);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="product-list">
      <SearchBar onSearch={handleSearch} placeholder="Search products..." />

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};
```

### React Native Mobile Application

```typescript
// mobile-app/src/services/ApiService.ts
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

class MobileApiService {
  private client: AxiosInstance;
  private offlineQueue: any[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.yourapp.com',
      timeout: 15000,
    });

    this.setupInterceptors();
    this.setupOfflineHandling();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  private setupOfflineHandling() {
    NetInfo.addEventListener((state) => {
      if (state.isConnected && this.offlineQueue.length > 0) {
        this.processOfflineQueue();
      }
    });
  }

  private async processOfflineQueue() {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const request of queue) {
      try {
        await this.client(request);
      } catch (error) {
        // Re-queue failed requests
        this.offlineQueue.push(request);
      }
    }
  }

  async get<T>(url: string): Promise<T> {
    try {
      const response = await this.client.get<T>(url);
      return response.data;
    } catch (error) {
      const cachedData = await this.getCachedData(url);
      if (cachedData) return cachedData;
      throw error;
    }
  }

  private async getCachedData(url: string) {
    try {
      const cached = await AsyncStorage.getItem(`cache_${url}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }
}

export const mobileApiService = new MobileApiService();
```

```typescript
// mobile-app/src/components/ProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: product.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.category}>{product.category}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#666',
  },
});
```

## Backend Microservices Ecosystem

### User Service (Node.js + TypeScript)

```typescript
// user-service/src/models/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @Column()
  @MinLength(8)
  password: string;

  @Column({ default: 'customer' })
  role: 'customer' | 'admin';

  @Column('json', { nullable: true })
  preferences: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 12);
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
```

```typescript
// user-service/src/services/UserService.ts
import { Repository } from 'typeorm';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';
import { EventEmitter } from '../utils/EventEmitter';
import { CacheService } from './CacheService';
import jwt from 'jsonwebtoken';

export class UserService {
  private userRepository: Repository<User>;
  private cacheService: CacheService;
  private eventEmitter: EventEmitter;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.cacheService = new CacheService();
    this.eventEmitter = new EventEmitter();
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    await user.hashPassword();

    const savedUser = await this.userRepository.save(user);

    // Cache user data
    await this.cacheService.set(`user:${savedUser.id}`, savedUser, 3600);

    // Emit user created event
    this.eventEmitter.emit('user.created', {
      userId: savedUser.id,
      email: savedUser.email,
      timestamp: new Date()
    });

    return savedUser;
  }

  async getUserById(id: string): Promise<User | null> {
    // Try cache first
    const cachedUser = await this.cacheService.get(`user:${id}`);
    if (cachedUser) {
      return cachedUser as User;
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (user) {
      await this.cacheService.set(`user:${id}`, user, 3600);
    }

    return user;
  }

  async authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return null;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Update last login
    await this.userRepository.update(user.id, { updatedAt: new Date() });

    // Emit login event
    this.eventEmitter.emit('user.login', {
      userId: user.id,
      timestamp: new Date()
    });

    return { user, token };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updates);

    // Invalidate cache
    await this.cacheService.delete(`user:${id}`);

    const updatedUser = await this.getUserById(id);

    if (updatedUser) {
      this.eventEmitter.emit('user.updated', {
        userId: id,
        changes: updates,
        timestamp: new Date()
      });
    }

    return updatedUser;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const cacheKey = `users:role:${role}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached as User[];
    }

    const users = await this.userRepository.find({ where: { role: role as any } });
    await this.cacheService.set(cacheKey, users, 1800);

    return users;
  }
}
```

### Product Service (Java Spring Boot)

```java
// product-service/src/main/java/com/ecommerce/product/entity/Product.java
package com.ecommerce.product.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "products")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 100, message = "Product name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Column(length = 1000)
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotBlank(message = "Category is required")
    @Column(nullable = false, length = 50)
    private String category;

    @Min(value = 0, message = "Inventory cannot be negative")
    @Column(nullable = false)
    private Integer inventory;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images;

    @ElementCollection
    @CollectionTable(name = "product_metadata", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "metadata_key")
    @Column(name = "metadata_value")
    private Map<String, String> metadata;

    @Column(nullable = false)
    private Boolean active = true;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Custom methods
    public boolean isInStock() {
        return inventory > 0;
    }

    public void decreaseInventory(int quantity) {
        if (inventory < quantity) {
            throw new IllegalArgumentException("Insufficient inventory");
        }
        inventory -= quantity;
    }

    public void increaseInventory(int quantity) {
        inventory += quantity;
    }
}
```

```java
// product-service/src/main/java/com/ecommerce/product/service/ProductService.java
package com.ecommerce.product.service;

import com.ecommerce.product.entity.Product;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.product.dto.ProductDTO;
import com.ecommerce.product.dto.ProductSearchCriteria;
import com.ecommerce.product.exception.ProductNotFoundException;
import com.ecommerce.product.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ElasticsearchService elasticsearchService;
    private final EventPublisher eventPublisher;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public ProductDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        // Log product view for analytics
        eventPublisher.publishEvent("product.viewed", Map.of(
            "productId", id,
            "timestamp", System.currentTimeMillis()
        ));

        return productMapper.toDTO(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> searchProducts(ProductSearchCriteria criteria, Pageable pageable) {
        if (criteria.hasSearchQuery()) {
            // Use Elasticsearch for complex search
            return elasticsearchService.searchProducts(criteria, pageable);
        }

        // Use database for simple queries
        Page<Product> products = productRepository.findByCriteria(criteria, pageable);
        return products.map(productMapper::toDTO);
    }

    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = productMapper.toEntity(productDTO);
        product.setActive(true);

        Product savedProduct = productRepository.save(product);

        // Index in Elasticsearch
        elasticsearchService.indexProduct(savedProduct);

        // Initialize inventory
        inventoryService.initializeInventory(savedProduct.getId(), savedProduct.getInventory());

        // Publish product created event
        eventPublisher.publishEvent("product.created", Map.of(
            "productId", savedProduct.getId(),
            "category", savedProduct.getCategory(),
            "price", savedProduct.getPrice(),
            "timestamp", System.currentTimeMillis()
        ));

        log.info("Product created successfully: {}", savedProduct.getId());
        return productMapper.toDTO(savedProduct);
    }

    @CacheEvict(value = "products", key = "#id")
    public ProductDTO updateProduct(String id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        // Map updates
        productMapper.updateEntityFromDTO(productDTO, existingProduct);

        Product updatedProduct = productRepository.save(existingProduct);

        // Update Elasticsearch index
        elasticsearchService.updateProduct(updatedProduct);

        // Update inventory if changed
        if (!existingProduct.getInventory().equals(updatedProduct.getInventory())) {
            inventoryService.updateInventory(id, updatedProduct.getInventory());
        }

        // Publish product updated event
        eventPublisher.publishEvent("product.updated", Map.of(
            "productId", id,
            "changes", productMapper.getChanges(existingProduct, updatedProduct),
            "timestamp", System.currentTimeMillis()
        ));

        return productMapper.toDTO(updatedProduct);
    }

    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        product.setActive(false);
        productRepository.save(product);

        // Remove from Elasticsearch
        elasticsearchService.deleteProduct(id);

        // Publish product deleted event
        eventPublisher.publishEvent("product.deleted", Map.of(
            "productId", id,
            "timestamp", System.currentTimeMillis()
        ));

        log.info("Product deleted successfully: {}", id);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(String category) {
        List<Product> products = productRepository.findByCategory(category);
        return products.stream()
                .map(productMapper::toDTO)
                .toList();
    }

    public boolean reserveInventory(String productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));

        if (!product.isInStock() || product.getInventory() < quantity) {
            return false;
        }

        product.decreaseInventory(quantity);
        productRepository.save(product);

        // Update inventory service
        inventoryService.reserveInventory(productId, quantity);

        // Publish inventory reserved event
        eventPublisher.publishEvent("inventory.reserved", Map.of(
            "productId", productId,
            "quantity", quantity,
            "remainingInventory", product.getInventory(),
            "timestamp", System.currentTimeMillis()
        ));

        return true;
    }
}
```

### Order Service (Go + Gin)

```go
// order-service/internal/models/order.go
package models

import (
    "time"
    "github.com/google/uuid"
    "gorm.io/gorm"
)

type OrderStatus string

const (
    OrderStatusPending    OrderStatus = "pending"
    OrderStatusProcessing OrderStatus = "processing"
    OrderStatusShipped    OrderStatus = "shipped"
    OrderStatusDelivered  OrderStatus = "delivered"
    OrderStatusCancelled  OrderStatus = "cancelled"
)

type Order struct {
    ID        string      `json:"id" gorm:"primaryKey;type:uuid"`
    UserID    string      `json:"userId" gorm:"not null;type:uuid"`
    Status    OrderStatus `json:"status" gorm:"not null;default:'pending'"`
    Total     float64     `json:"total" gorm:"not null"`
    Currency  string      `json:"currency" gorm:"not null;default:'USD'"`
    Items     []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
    Address   Address     `json:"address" gorm:"embedded"`
    CreatedAt time.Time   `json:"createdAt"`
    UpdatedAt time.Time   `json:"updatedAt"`
}

type OrderItem struct {
    ID        string  `json:"id" gorm:"primaryKey;type:uuid"`
    OrderID   string  `json:"orderId" gorm:"not null;type:uuid"`
    ProductID string  `json:"productId" gorm:"not null;type:uuid"`
    Quantity  int     `json:"quantity" gorm:"not null"`
    Price     float64 `json:"price" gorm:"not null"`
}

type Address struct {
    Street     string `json:"street"`
    City       string `json:"city"`
    State      string `json:"state"`
    PostalCode string `json:"postalCode"`
    Country    string `json:"country"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
    if o.ID == "" {
        o.ID = uuid.New().String()
    }
    return nil
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
    if oi.ID == "" {
        oi.ID = uuid.New().String()
    }
    return nil
}
```

```go
// order-service/internal/services/order_service.go
package services

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "time"

    "github.com/go-redis/redis/v8"
    "gorm.io/gorm"

    "order-service/internal/models"
    "order-service/internal/clients"
    "order-service/internal/events"
)

type OrderService struct {
    db            *gorm.DB
    redis         *redis.Client
    productClient *clients.ProductClient
    userClient    *clients.UserClient
    eventEmitter  *events.EventEmitter
}

func NewOrderService(db *gorm.DB, redis *redis.Client) *OrderService {
    return &OrderService{
        db:            db,
        redis:         redis,
        productClient: clients.NewProductClient(),
        userClient:    clients.NewUserClient(),
        eventEmitter:  events.NewEventEmitter(),
    }
}

func (s *OrderService) CreateOrder(ctx context.Context, userID string, items []models.OrderItem, address models.Address) (*models.Order, error) {
    // Start transaction
    tx := s.db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Validate user exists
    user, err := s.userClient.GetUser(ctx, userID)
    if err != nil {
        tx.Rollback()
        return nil, fmt.Errorf("invalid user: %w", err)
    }

    // Validate and reserve inventory for each item
    var total float64
    var validatedItems []models.OrderItem

    for _, item := range items {
        product, err := s.productClient.GetProduct(ctx, item.ProductID)
        if err != nil {
            tx.Rollback()
            return nil, fmt.Errorf("invalid product %s: %w", item.ProductID, err)
        }

        // Check inventory
        available, err := s.productClient.CheckInventory(ctx, item.ProductID, item.Quantity)
        if err != nil || !available {
            tx.Rollback()
            return nil, fmt.Errorf("insufficient inventory for product %s", item.ProductID)
        }

        // Reserve inventory
        if err := s.productClient.ReserveInventory(ctx, item.ProductID, item.Quantity); err != nil {
            tx.Rollback()
            return nil, fmt.Errorf("failed to reserve inventory: %w", err)
        }

        item.Price = product.Price
        total += product.Price * float64(item.Quantity)
        validatedItems = append(validatedItems, item)
    }

    // Create order
    order := &models.Order{
        UserID:  userID,
        Status:  models.OrderStatusPending,
        Total:   total,
        Address: address,
        Items:   validatedItems,
    }

    if err := tx.Create(order).Error; err != nil {
        tx.Rollback()
        return nil, fmt.Errorf("failed to create order: %w", err)
    }

    // Commit transaction
    if err := tx.Commit().Error; err != nil {
        return nil, fmt.Errorf("failed to commit transaction: %w", err)
    }

    // Cache order
    orderJSON, _ := json.Marshal(order)
    s.redis.Set(ctx, fmt.Sprintf("order:%s", order.ID), orderJSON, time.Hour)

    // Emit order created event
    s.eventEmitter.EmitEvent("order.created", map[string]interface{}{
        "orderId":   order.ID,
        "userId":    order.UserID,
        "total":     order.Total,
        "itemCount": len(order.Items),
        "timestamp": time.Now().Unix(),
    })

    // Send confirmation email asynchronously
    go s.sendOrderConfirmation(order, user.Email)

    log.Printf("Order created successfully: %s", order.ID)
    return order, nil
}

func (s *OrderService) GetOrder(ctx context.Context, orderID string) (*models.Order, error) {
    // Try cache first
    cached, err := s.redis.Get(ctx, fmt.Sprintf("order:%s", orderID)).Result()
    if err == nil {
        var order models.Order
        if json.Unmarshal([]byte(cached), &order) == nil {
            return &order, nil
        }
    }

    // Fallback to database
    var order models.Order
    if err := s.db.Preload("Items").First(&order, "id = ?", orderID).Error; err != nil {
        return nil, fmt.Errorf("order not found: %w", err)
    }

    // Update cache
    orderJSON, _ := json.Marshal(order)
    s.redis.Set(ctx, fmt.Sprintf("order:%s", orderID), orderJSON, time.Hour)

    return &order, nil
}

func (s *OrderService) UpdateOrderStatus(ctx context.Context, orderID string, status models.OrderStatus) error {
    var order models.Order
    if err := s.db.First(&order, "id = ?", orderID).Error; err != nil {
        return fmt.Errorf("order not found: %w", err)
    }

    oldStatus := order.Status
    order.Status = status

    if err := s.db.Save(&order).Error; err != nil {
        return fmt.Errorf("failed to update order status: %w", err)
    }

    // Invalidate cache
    s.redis.Del(ctx, fmt.Sprintf("order:%s", orderID))

    // Emit status change event
    s.eventEmitter.EmitEvent("order.status_changed", map[string]interface{}{
        "orderId":   orderID,
        "oldStatus": oldStatus,
        "newStatus": status,
        "timestamp": time.Now().Unix(),
    })

    // Handle status-specific logic
    switch status {
    case models.OrderStatusProcessing:
        go s.processPayment(ctx, &order)
    case models.OrderStatusShipped:
        go s.sendShippingNotification(&order)
    case models.OrderStatusCancelled:
        go s.restoreInventory(ctx, &order)
    }

    return nil
}

func (s *OrderService) GetOrdersByUser(ctx context.Context, userID string, limit, offset int) ([]models.Order, error) {
    var orders []models.Order

    if err := s.db.Preload("Items").Where("user_id = ?", userID).
        Limit(limit).Offset(offset).
        Order("created_at DESC").
        Find(&orders).Error; err != nil {
        return nil, fmt.Errorf("failed to get user orders: %w", err)
    }

    return orders, nil
}

func (s *OrderService) sendOrderConfirmation(order *models.Order, userEmail string) {
    // Implementation for sending order confirmation email
    log.Printf("Sending order confirmation to %s for order %s", userEmail, order.ID)
    // This would integrate with an email service
}

func (s *OrderService) processPayment(ctx context.Context, order *models.Order) {
    // Implementation for payment processing
    log.Printf("Processing payment for order %s", order.ID)
    // This would integrate with a payment service
}

func (s *OrderService) sendShippingNotification(order *models.Order) {
    // Implementation for shipping notifications
    log.Printf("Sending shipping notification for order %s", order.ID)
}

func (s *OrderService) restoreInventory(ctx context.Context, order *models.Order) {
    // Restore inventory for cancelled orders
    for _, item := range order.Items {
        if err := s.productClient.RestoreInventory(ctx, item.ProductID, item.Quantity); err != nil {
            log.Printf("Failed to restore inventory for product %s: %v", item.ProductID, err)
        }
    }
}
```

### Analytics Service (Python + FastAPI)

```python
# analytics-service/app/models.py
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
import uuid

Base = declarative_base()

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(100), nullable=False, index=True)
    user_id = Column(String(100), index=True)
    product_id = Column(String(100), index=True)
    session_id = Column(String(100), index=True)
    properties = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    processed = Column(Boolean, default=False, index=True)

class UserBehavior(Base):
    __tablename__ = "user_behaviors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(100), nullable=False, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    page_views = Column(Integer, default=0)
    time_spent = Column(Float, default=0.0)
    bounce_rate = Column(Float)
    conversion_events = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ProductAnalytics(Base):
    __tablename__ = "product_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(String(100), nullable=False, index=True)
    views = Column(Integer, default=0)
    purchases = Column(Integer, default=0)
    conversion_rate = Column(Float, default=0.0)
    revenue = Column(Float, default=0.0)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
```

```python
# analytics-service/app/services/analytics_service.py
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
import pandas as pd
import numpy as np
from scipy import stats

from app.models import Event, UserBehavior, ProductAnalytics
from app.core.database import get_db
from app.core.cache import redis_client
from app.services.ml_service import MLService
import json

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        self.ml_service = MLService()

    async def track_event(self, event_data: Dict[str, Any]) -> bool:
        """Track a single event"""
        try:
            event = Event(
                event_type=event_data["event_type"],
                user_id=event_data.get("user_id"),
                product_id=event_data.get("product_id"),
                session_id=event_data.get("session_id"),
                properties=event_data.get("properties", {})
            )

            self.db.add(event)
            self.db.commit()

            # Process event asynchronously
            await self._process_event_async(event)

            return True
        except Exception as e:
            self.db.rollback()
            raise e

    async def _process_event_async(self, event: Event):
        """Process event for real-time analytics"""
        cache_key = f"events:processed:{event.id}"

        # Update user behavior metrics
        await self._update_user_behavior(event)

        # Update product analytics
        if event.product_id:
            await self._update_product_analytics(event)

        # Check for conversion events
        if event.event_type in ["purchase", "add_to_cart", "checkout"]:
            await self._process_conversion_event(event)

        # Update real-time dashboard metrics
        await self._update_realtime_metrics(event)

        redis_client.set(cache_key, "processed", ex=3600)

    async def _update_user_behavior(self, event: Event):
        """Update user behavior analytics"""
        if not event.user_id:
            return

        # Get or create user behavior record
        behavior = self.db.query(UserBehavior).filter(
            and_(
                UserBehavior.user_id == event.user_id,
                UserBehavior.session_id == event.session_id
            )
        ).first()

        if not behavior:
            behavior = UserBehavior(
                user_id=event.user_id,
                session_id=event.session_id
            )
            self.db.add(behavior)

        # Update metrics based on event type
        if event.event_type == "page_view":
            behavior.page_views += 1
        elif event.event_type == "time_spent":
            time_spent = event.properties.get("duration", 0)
            behavior.time_spent += time_spent

        # Update conversion events
        if event.event_type in ["purchase", "signup", "subscription"]:
            conversion_events = behavior.conversion_events or []
            conversion_events.append({
                "event": event.event_type,
                "timestamp": datetime.utcnow().isoformat(),
                "properties": event.properties
            })
            behavior.conversion_events = conversion_events

        self.db.commit()

    async def _update_product_analytics(self, event: Event):
        """Update product analytics"""
        today = datetime.utcnow().date()

        analytics = self.db.query(ProductAnalytics).filter(
            and_(
                ProductAnalytics.product_id == event.product_id,
                func.date(ProductAnalytics.date) == today
            )
        ).first()

        if not analytics:
            analytics = ProductAnalytics(
                product_id=event.product_id,
                date=today
            )
            self.db.add(analytics)

        # Update metrics based on event type
        if event.event_type == "product_view":
            analytics.views += 1
        elif event.event_type == "purchase":
            analytics.purchases += 1
            analytics.revenue += event.properties.get("amount", 0)

        # Calculate conversion rate
        if analytics.views > 0:
            analytics.conversion_rate = analytics.purchases / analytics.views

        self.db.commit()

    def get_user_analytics(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive user analytics"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        # Get user events
        events = self.db.query(Event).filter(
            and_(
                Event.user_id == user_id,
                Event.timestamp >= start_date
            )
        ).all()

        # Get user behavior data
        behaviors = self.db.query(UserBehavior).filter(
            UserBehavior.user_id == user_id
        ).all()

        # Calculate metrics
        total_sessions = len(set([b.session_id for b in behaviors]))
        total_page_views = sum([b.page_views for b in behaviors])
        total_time_spent = sum([b.time_spent for b in behaviors])
        conversion_events = []

        for behavior in behaviors:
            if behavior.conversion_events:
                conversion_events.extend(behavior.conversion_events)

        # Calculate engagement score
        engagement_score = self._calculate_engagement_score(
            total_sessions, total_page_views, total_time_spent, len(conversion_events)
        )

        # Get user segments
        segments = self.ml_service.get_user_segments(user_id)

        return {
            "user_id": user_id,
            "period_days": days,
            "metrics": {
                "total_sessions": total_sessions,
                "total_page_views": total_page_views,
                "total_time_spent": total_time_spent,
                "conversion_events": len(conversion_events),
                "engagement_score": engagement_score
            },
            "segments": segments,
            "conversion_funnel": self._analyze_conversion_funnel(events),
            "behavioral_patterns": self._analyze_behavioral_patterns(events)
        }

    def get_product_analytics(self, product_id: str, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive product analytics"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        # Get product analytics data
        analytics = self.db.query(ProductAnalytics).filter(
            and_(
                ProductAnalytics.product_id == product_id,
                ProductAnalytics.date >= start_date.date()
            )
        ).all()

        if not analytics:
            return {"error": "No analytics data found for this product"}

        # Aggregate metrics
        total_views = sum([a.views for a in analytics])
        total_purchases = sum([a.purchases for a in analytics])
        total_revenue = sum([a.revenue for a in analytics])
        avg_conversion_rate = np.mean([a.conversion_rate for a in analytics])

        # Create time series data
        time_series = []
        for a in analytics:
            time_series.append({
                "date": a.date.isoformat(),
                "views": a.views,
                "purchases": a.purchases,
                "conversion_rate": a.conversion_rate,
                "revenue": a.revenue
            })

        # Perform trend analysis
        dates = [a.date for a in analytics]
        views = [a.views for a in analytics]

        if len(views) > 2:
            view_trend = self._calculate_trend(views)
            revenue_trend = self._calculate_trend([a.revenue for a in analytics])
        else:
            view_trend = revenue_trend = "insufficient_data"

        return {
            "product_id": product_id,
            "period_days": days,
            "summary": {
                "total_views": total_views,
                "total_purchases": total_purchases,
                "total_revenue": total_revenue,
                "average_conversion_rate": avg_conversion_rate,
                "view_trend": view_trend,
                "revenue_trend": revenue_trend
            },
            "time_series": time_series,
            "recommendations": self.ml_service.get_product_recommendations(product_id)
        }

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        """Get real-time dashboard metrics"""
        # Check cache first
        cached = redis_client.get("dashboard:metrics")
        if cached:
            return json.loads(cached)

        # Calculate metrics
        today = datetime.utcnow().date()
        yesterday = today - timedelta(days=1)
        week_ago = today - timedelta(days=7)

        # Today's metrics
        today_events = self.db.query(Event).filter(
            func.date(Event.timestamp) == today
        ).count()

        # Active users today
        active_users_today = self.db.query(Event.user_id).filter(
            func.date(Event.timestamp) == today
        ).distinct().count()

        # Revenue today
        revenue_today = self.db.query(func.sum(ProductAnalytics.revenue)).filter(
            ProductAnalytics.date == today
        ).scalar() or 0

        # Conversion rate today
        purchases_today = self.db.query(Event).filter(
            and_(
                Event.event_type == "purchase",
                func.date(Event.timestamp) == today
            )
        ).count()

        sessions_today = self.db.query(UserBehavior.session_id).filter(
            func.date(UserBehavior.created_at) == today
        ).distinct().count()

        conversion_rate_today = (purchases_today / sessions_today * 100) if sessions_today > 0 else 0

        # Compare with yesterday
        yesterday_revenue = self.db.query(func.sum(ProductAnalytics.revenue)).filter(
            ProductAnalytics.date == yesterday
        ).scalar() or 0

        revenue_change = ((revenue_today - yesterday_revenue) / yesterday_revenue * 100) if yesterday_revenue > 0 else 0

        metrics = {
            "real_time": {
                "active_users": active_users_today,
                "total_events": today_events,
                "revenue_today": revenue_today,
                "conversion_rate": round(conversion_rate_today, 2),
                "revenue_change_percent": round(revenue_change, 2)
            },
            "top_products": self._get_top_products(7),
            "user_acquisition": self._get_user_acquisition_metrics(7),
            "geographic_data": self._get_geographic_metrics(1),
            "last_updated": datetime.utcnow().isoformat()
        }

        # Cache for 5 minutes
        redis_client.set("dashboard:metrics", json.dumps(metrics), ex=300)

        return metrics

    def _calculate_engagement_score(self, sessions: int, page_views: int, time_spent: float, conversions: int) -> float:
        """Calculate user engagement score"""
        # Normalize metrics and calculate weighted score
        session_score = min(sessions / 10, 1) * 0.3
        page_view_score = min(page_views / 50, 1) * 0.3
        time_score = min(time_spent / 3600, 1) * 0.2  # Max 1 hour
        conversion_score = min(conversions / 5, 1) * 0.2

        return round((session_score + page_view_score + time_score + conversion_score) * 100, 2)

    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction using linear regression"""
        if len(values) < 2:
            return "insufficient_data"

        x = np.arange(len(values))
        slope, _, r_value, p_value, _ = stats.linregress(x, values)

        if p_value > 0.05:
            return "stable"
        elif slope > 0:
            return "increasing"
        else:
            return "decreasing"

    def _analyze_conversion_funnel(self, events: List[Event]) -> Dict[str, Any]:
        """Analyze conversion funnel from events"""
        funnel_steps = ["product_view", "add_to_cart", "checkout", "purchase"]
        funnel_data = {}

        for step in funnel_steps:
            count = len([e for e in events if e.event_type == step])
            funnel_data[step] = count

        return funnel_data

    def _analyze_behavioral_patterns(self, events: List[Event]) -> Dict[str, Any]:
        """Analyze user behavioral patterns"""
        # Group events by hour to find activity patterns
        hourly_activity = {}
        for event in events:
            hour = event.timestamp.hour
            hourly_activity[hour] = hourly_activity.get(hour, 0) + 1

        # Find most active hours
        if hourly_activity:
            most_active_hour = max(hourly_activity, key=hourly_activity.get)
            least_active_hour = min(hourly_activity, key=hourly_activity.get)
        else:
            most_active_hour = least_active_hour = None

        return {
            "most_active_hour": most_active_hour,
            "least_active_hour": least_active_hour,
            "hourly_distribution": hourly_activity
        }
```

## Data Pipeline and Analytics Integration

### Real-time Data Pipeline (Kafka + Spark)

```python
# analytics-pipeline/spark_streaming.py
from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
import json

class RealTimeAnalyticsPipeline:
    def __init__(self):
        self.spark = SparkSession.builder \
            .appName("E-commerce Analytics Pipeline") \
            .config("spark.sql.adaptive.enabled", "true") \
            .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
            .getOrCreate()

        self.spark.sparkContext.setLogLevel("WARN")

    def process_user_events(self):
        """Process real-time user events from Kafka"""
        # Read from Kafka
        df = self.spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "localhost:9092") \
            .option("subscribe", "user-events") \
            .option("startingOffsets", "latest") \
            .load()

        # Parse JSON messages
        schema = StructType([
            StructField("user_id", StringType(), True),
            StructField("event_type", StringType(), True),
            StructField("product_id", StringType(), True),
            StructField("session_id", StringType(), True),
            StructField("timestamp", TimestampType(), True),
            StructField("properties", MapType(StringType(), StringType()), True)
        ])

        events_df = df.select(
            from_json(col("value").cast("string"), schema).alias("data")
        ).select("data.*")

        # Real-time aggregations
        user_activity = events_df \
            .withWatermark("timestamp", "10 minutes") \
            .groupBy(
                window(col("timestamp"), "5 minutes"),
                col("user_id")
            ) \
            .agg(
                count("*").alias("event_count"),
                countDistinct("product_id").alias("unique_products_viewed"),
                collect_list("event_type").alias("event_sequence")
            )

        # Write to multiple sinks
        query = user_activity.writeStream \
            .outputMode("update") \
            .format("console") \
            .option("truncate", "false") \
            .trigger(processingTime="30 seconds") \
            .start()

        # Also write to database
        user_activity.writeStream \
            .outputMode("update") \
            .format("jdbc") \
            .option("url", "jdbc:postgresql://localhost:5432/analytics") \
            .option("dbtable", "real_time_user_activity") \
            .option("user", "postgres") \
            .option("password", "password") \
            .option("driver", "org.postgresql.Driver") \
            .option("checkpointLocation", "/tmp/checkpoint/user_activity") \
            .trigger(processingTime="1 minute") \
            .start()

        return query

    def process_product_analytics(self):
        """Process product analytics in real-time"""
        df = self.spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "localhost:9092") \
            .option("subscribe", "product-events") \
            .load()

        schema = StructType([
            StructField("product_id", StringType(), True),
            StructField("event_type", StringType(), True),
            StructField("user_id", StringType(), True),
            StructField("price", DoubleType(), True),
            StructField("quantity", IntegerType(), True),
            StructField("timestamp", TimestampType(), True)
        ])

        product_events = df.select(
            from_json(col("value").cast("string"), schema).alias("data")
        ).select("data.*")

        # Calculate product metrics
        product_metrics = product_events \
            .withWatermark("timestamp", "15 minutes") \
            .groupBy(
                window(col("timestamp"), "10 minutes", "5 minutes"),
                col("product_id")
            ) \
            .agg(
                sum(when(col("event_type") == "view", 1).otherwise(0)).alias("views"),
                sum(when(col("event_type") == "purchase", col("quantity")).otherwise(0)).alias("purchases"),
                sum(when(col("event_type") == "purchase", col("price") * col("quantity")).otherwise(0)).alias("revenue"),
                countDistinct("user_id").alias("unique_users")
            ) \
            .withColumn(
                "conversion_rate",
                when(col("views") > 0, col("purchases") / col("views") * 100).otherwise(0)
            )

        # Write to time-series database for dashboards
        query = product_metrics.writeStream \
            .outputMode("append") \
            .format("org.apache.spark.sql.cassandra") \
            .option("keyspace", "analytics") \
            .option("table", "product_metrics_time_series") \
            .option("checkpointLocation", "/tmp/checkpoint/product_metrics") \
            .trigger(processingTime="2 minutes") \
            .start()

        return query

    def detect_anomalies(self):
        """Detect anomalies in user behavior"""
        df = self.spark.readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "localhost:9092") \
            .option("subscribe", "user-events") \
            .load()

        # Implement anomaly detection logic
        # This is a simplified example - in production you'd use more sophisticated ML models
        user_sessions = df.groupBy("user_id", "session_id") \
            .agg(
                count("*").alias("event_count"),
                (max("timestamp") - min("timestamp")).alias("session_duration")
            )

        anomalies = user_sessions.filter(
            (col("event_count") > 1000) |  # Too many events
            (col("session_duration") > 3600)  # Session too long
        )

        # Send alerts for anomalies
        query = anomalies.writeStream \
            .outputMode("append") \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "localhost:9092") \
            .option("topic", "anomaly-alerts") \
            .option("checkpointLocation", "/tmp/checkpoint/anomalies") \
            .start()

        return query

    def start_pipeline(self):
        """Start all streaming queries"""
        queries = [
            self.process_user_events(),
            self.process_product_analytics(),
            self.detect_anomalies()
        ]

        # Wait for all queries to complete
        for query in queries:
            query.awaitTermination()

if __name__ == "__main__":
    pipeline = RealTimeAnalyticsPipeline()
    pipeline.start_pipeline()
```

## Infrastructure and Deployment

### Kubernetes Deployment

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ecommerce-ecosystem
---
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-web
  namespace: ecommerce-ecosystem
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend-web
  template:
    metadata:
      labels:
        app: frontend-web
    spec:
      containers:
      - name: frontend-web
        image: ecommerce/frontend-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: REACT_APP_API_URL
          value: "https://api.ecommerce.com"
        - name: REACT_APP_ANALYTICS_URL
          value: "https://analytics.ecommerce.com"
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
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-web-service
  namespace: ecommerce-ecosystem
spec:
  selector:
    app: frontend-web
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
---
# k8s/backend-services.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: ecommerce-ecosystem
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: ecommerce/user-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: user-db-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: cache-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 45
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: ecommerce-ecosystem
spec:
  selector:
    app: user-service
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP
```

### Docker Compose for Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend Services
  frontend-web:
    build:
      context: ./frontend-web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8080
      - REACT_APP_ANALYTICS_URL=http://localhost:8000
    volumes:
      - ./frontend-web:/app
      - /app/node_modules
    depends_on:
      - api-gateway

  mobile-app-build:
    build:
      context: ./mobile-app
      dockerfile: Dockerfile
    volumes:
      - ./mobile-app:/app
      - /app/node_modules
    command: npm run build

  # Backend Services
  api-gateway:
    image: kong:latest
    ports:
      - "8080:8000"
      - "8443:8443"
      - "8001:8001"
      - "8444:8444"
    environment:
      - KONG_DATABASE=postgres
      - KONG_PG_HOST=postgres
      - KONG_PG_DATABASE=kong
      - KONG_PG_USER=kong
      - KONG_PG_PASSWORD=kong
      - KONG_ADMIN_LISTEN=0.0.0.0:8001
    depends_on:
      - postgres
      - user-service
      - product-service
      - order-service

  user-service:
    build:
      context: ./user-service
      dockerfile: Dockerfile
    ports:
      - "3001:8080"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/users
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-jwt-secret-key
    depends_on:
      - postgres
      - redis
    volumes:
      - ./user-service:/app
      - /app/node_modules

  product-service:
    build:
      context: ./product-service
      dockerfile: Dockerfile
    ports:
      - "3002:8080"
    environment:
      - DATABASE_URL=postgresql://product:password@postgres:5432/products
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - elasticsearch
      - redis

  order-service:
    build:
      context: ./order-service
      dockerfile: Dockerfile
    ports:
      - "3003:8080"
    environment:
      - DATABASE_URL=postgresql://order:password@postgres:5432/orders
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:9092
    depends_on:
      - postgres
      - redis
      - kafka

  analytics-service:
    build:
      context: ./analytics-service
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://analytics:password@postgres:5432/analytics
      - MONGODB_URL=mongodb://mongodb:27017/analytics
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - mongodb
      - redis

  # Data Stores
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_MULTIPLE_DATABASES=users,products,orders,analytics,kong
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-databases.sh:/docker-entrypoint-initdb.d/init-databases.sh

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongodb_data:/data/db

  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  # Message Queue
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  # Analytics Pipeline
  spark-master:
    image: bitnami/spark:latest
    command: bin/spark-class org.apache.spark.deploy.master.Master
    ports:
      - "8080:8080"
      - "7077:7077"
    environment:
      - SPARK_MODE=master
      - SPARK_RPC_AUTHENTICATION_ENABLED=no
      - SPARK_RPC_ENCRYPTION_ENABLED=no
      - SPARK_LOCAL_STORAGE_ENCRYPTION_ENABLED=no
      - SPARK_SSL_ENABLED=no

  spark-worker:
    image: bitnami/spark:latest
    command: bin/spark-class org.apache.spark.deploy.worker.Worker spark://spark-master:7077
    depends_on:
      - spark-master
    environment:
      - SPARK_MODE=worker
      - SPARK_MASTER_URL=spark://spark-master:7077
      - SPARK_WORKER_MEMORY=1G
      - SPARK_WORKER_CORES=1

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3030:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards

  # Logging
  elasticsearch-log:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms256m -Xmx256m"
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_log_data:/usr/share/elasticsearch/data

  logstash:
    image: logstash:8.8.0
    ports:
      - "5000:5000"
      - "5044:5044"
    volumes:
      - ./logging/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch-log

  kibana:
    image: kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch-log:9200
    depends_on:
      - elasticsearch-log

volumes:
  postgres_data:
  redis_data:
  mongodb_data:
  elasticsearch_data:
  elasticsearch_log_data:
  prometheus_data:
  grafana_data:
```

This comprehensive ecosystem tutorial demonstrates how modern software systems integrate multiple technologies to create scalable, maintainable, and feature-rich applications. The architecture spans from frontend user interfaces to backend microservices, data processing pipelines, and deployment infrastructure, showing how each component contributes to the overall system functionality.
## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
