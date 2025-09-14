# Integration Testing Tutorial

## Introduction

Integration testing verifies that different components or services work correctly together. It focuses on testing the interfaces and interaction between integrated components to detect interface defects between modules.

## What is Integration Testing?

Integration testing is a software testing methodology where individual components are combined and tested as a group. The main purpose is to expose faults in the interaction between integrated units.

### Types of Integration Testing

1. **Big Bang Integration**: All components are integrated simultaneously
2. **Incremental Integration**: Components are integrated one by one
   - **Top-Down**: Integration starts from top-level modules
   - **Bottom-Up**: Integration starts from bottom-level modules
   - **Sandwich/Hybrid**: Combination of top-down and bottom-up

## Testing Frameworks and Tools

### Jest for JavaScript/Node.js

```javascript
// package.json
{
  "scripts": {
    "test": "jest",
    "test:integration": "jest --testMatch='**/integration/**/*.test.js'"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "@testing-library/react": "^13.0.0"
  }
}

// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/integration/**/*.test.js',
    '**/integration/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ]
};
```

### API Integration Testing

```javascript
// tests/integration/api.test.js
const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database');

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await db.connect();
    await db.migrate();
  });

  afterAll(async () => {
    // Cleanup
    await db.cleanup();
    await db.disconnect();
  });

  beforeEach(async () => {
    // Reset database state before each test
    await db.truncate();
    await db.seed();
  });

  describe('User Management', () => {
    test('should create, retrieve, and delete a user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      // Create user
      const createResponse = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.name).toBe(newUser.name);
      expect(createResponse.body.email).toBe(newUser.email);

      const userId = createResponse.body.id;

      // Retrieve user
      const getResponse = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(getResponse.body.id).toBe(userId);
      expect(getResponse.body.name).toBe(newUser.name);

      // Update user
      const updateData = { name: 'Jane Doe' };
      const updateResponse = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.name).toBe(updateData.name);

      // Delete user
      await request(app)
        .delete(`/api/users/${userId}`)
        .expect(204);

      // Verify deletion
      await request(app)
        .get(`/api/users/${userId}`)
        .expect(404);
    });

    test('should handle authentication flow', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Register user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          ...userData
        })
        .expect(201);

      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(userData)
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      const token = loginResponse.body.token;

      // Access protected route
      const protectedResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(protectedResponse.body.email).toBe(userData.email);

      // Access without token should fail
      await request(app)
        .get('/api/auth/profile')
        .expect(401);
    });
  });

  describe('Order Processing', () => {
    test('should process complete order workflow', async () => {
      // Create user first
      const userResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Customer',
          email: 'customer@example.com',
          password: 'password123'
        })
        .expect(201);

      const userId = userResponse.body.id;

      // Create product
      const productResponse = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          price: 99.99,
          stock: 10
        })
        .expect(201);

      const productId = productResponse.body.id;

      // Create order
      const orderData = {
        userId: userId,
        items: [
          {
            productId: productId,
            quantity: 2,
            price: 99.99
          }
        ]
      };

      const orderResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(orderResponse.body).toHaveProperty('id');
      expect(orderResponse.body.total).toBe(199.98);
      expect(orderResponse.body.status).toBe('pending');

      const orderId = orderResponse.body.id;

      // Process payment
      const paymentResponse = await request(app)
        .post(`/api/orders/${orderId}/payment`)
        .send({
          method: 'credit_card',
          amount: 199.98
        })
        .expect(200);

      expect(paymentResponse.body.status).toBe('paid');

      // Check stock was reduced
      const updatedProduct = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(updatedProduct.body.stock).toBe(8);

      // Fulfill order
      await request(app)
        .post(`/api/orders/${orderId}/fulfill`)
        .expect(200);

      // Verify order status
      const finalOrder = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      expect(finalOrder.body.status).toBe('fulfilled');
    });
  });
});
```

### Database Integration Testing

```javascript
// tests/integration/database.test.js
const { Pool } = require('pg');
const UserRepository = require('../../src/repositories/UserRepository');
const OrderRepository = require('../../src/repositories/OrderRepository');

describe('Database Integration Tests', () => {
  let db;
  let userRepo;
  let orderRepo;

  beforeAll(async () => {
    db = new Pool({
      connectionString: process.env.TEST_DATABASE_URL
    });

    userRepo = new UserRepository(db);
    orderRepo = new OrderRepository(db);
  });

  afterAll(async () => {
    await db.end();
  });

  beforeEach(async () => {
    // Clear all tables
    await db.query('TRUNCATE TABLE orders CASCADE');
    await db.query('TRUNCATE TABLE users CASCADE');
  });

  describe('User and Order Relationship', () => {
    test('should maintain referential integrity', async () => {
      // Create user
      const user = await userRepo.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password'
      });

      expect(user).toHaveProperty('id');
      expect(user.name).toBe('John Doe');

      // Create order for user
      const order = await orderRepo.create({
        userId: user.id,
        total: 100.00,
        status: 'pending'
      });

      expect(order).toHaveProperty('id');
      expect(order.userId).toBe(user.id);

      // Verify relationship
      const userWithOrders = await userRepo.findByIdWithOrders(user.id);
      expect(userWithOrders.orders).toHaveLength(1);
      expect(userWithOrders.orders[0].id).toBe(order.id);

      // Try to delete user with orders (should fail due to foreign key)
      await expect(userRepo.delete(user.id)).rejects.toThrow();

      // Delete order first, then user
      await orderRepo.delete(order.id);
      await userRepo.delete(user.id);

      // Verify both are deleted
      const deletedUser = await userRepo.findById(user.id);
      expect(deletedUser).toBeNull();
    });

    test('should handle transactions correctly', async () => {
      const client = await db.connect();

      try {
        await client.query('BEGIN');

        // Create user within transaction
        const userResult = await client.query(
          'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
          ['Transaction User', 'trans@example.com', 'password']
        );
        const user = userResult.rows[0];

        // Create order within transaction
        await client.query(
          'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)',
          [user.id, 150.00, 'pending']
        );

        // Simulate error and rollback
        await client.query('ROLLBACK');

        // Verify nothing was committed
        const users = await userRepo.findAll();
        expect(users).toHaveLength(0);

      } finally {
        client.release();
      }
    });
  });

  describe('Complex Queries', () => {
    test('should handle complex joins and aggregations', async () => {
      // Setup test data
      const users = [];
      for (let i = 0; i < 3; i++) {
        const user = await userRepo.create({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: 'password'
        });
        users.push(user);
      }

      // Create orders for users
      for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < i + 1; j++) {
          await orderRepo.create({
            userId: users[i].id,
            total: (j + 1) * 50,
            status: j % 2 === 0 ? 'completed' : 'pending'
          });
        }
      }

      // Test aggregation query
      const result = await db.query(`
        SELECT
          u.name,
          COUNT(o.id) as order_count,
          SUM(o.total) as total_spent,
          AVG(o.total) as avg_order_value
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id, u.name
        ORDER BY total_spent DESC
      `);

      expect(result.rows).toHaveLength(3);
      expect(result.rows[0].name).toBe('User 2'); // Should have highest total
      expect(parseFloat(result.rows[0].total_spent)).toBe(150); // 50 + 100
    });
  });
});
```

## Python Integration Testing

### FastAPI Integration Testing

```python
# tests/integration/test_api.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from app.main import app
from app.database import get_db, Base
from app.models import User, Product, Order

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    # Create test database tables
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    # Drop test database tables
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(autouse=True)
def clear_db():
    """Clear database before each test"""
    db = TestingSessionLocal()
    try:
        db.query(Order).delete()
        db.query(Product).delete()
        db.query(User).delete()
        db.commit()
    finally:
        db.close()

class TestUserAPI:
    def test_user_crud_operations(self, client):
        # Create user
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123"
        }

        response = client.post("/users/", json=user_data)
        assert response.status_code == 201
        created_user = response.json()
        assert created_user["name"] == user_data["name"]
        assert created_user["email"] == user_data["email"]
        assert "id" in created_user
        user_id = created_user["id"]

        # Get user
        response = client.get(f"/users/{user_id}")
        assert response.status_code == 200
        user = response.json()
        assert user["id"] == user_id
        assert user["name"] == user_data["name"]

        # Update user
        update_data = {"name": "Jane Doe"}
        response = client.put(f"/users/{user_id}", json=update_data)
        assert response.status_code == 200
        updated_user = response.json()
        assert updated_user["name"] == update_data["name"]

        # Delete user
        response = client.delete(f"/users/{user_id}")
        assert response.status_code == 204

        # Verify deletion
        response = client.get(f"/users/{user_id}")
        assert response.status_code == 404

    def test_authentication_flow(self, client):
        # Register user
        register_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123"
        }

        response = client.post("/auth/register", json=register_data)
        assert response.status_code == 201

        # Login
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }

        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 200
        auth_data = response.json()
        assert "access_token" in auth_data
        token = auth_data["access_token"]

        # Access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 200
        profile = response.json()
        assert profile["email"] == register_data["email"]

        # Access without token should fail
        response = client.get("/auth/me")
        assert response.status_code == 401

class TestOrderProcessing:
    def test_complete_order_workflow(self, client):
        # Create user
        user_data = {
            "name": "Customer",
            "email": "customer@example.com",
            "password": "password123"
        }
        user_response = client.post("/users/", json=user_data)
        user_id = user_response.json()["id"]

        # Create product
        product_data = {
            "name": "Test Product",
            "price": 99.99,
            "stock": 10
        }
        product_response = client.post("/products/", json=product_data)
        product_id = product_response.json()["id"]

        # Create order
        order_data = {
            "user_id": user_id,
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 2,
                    "price": 99.99
                }
            ]
        }

        order_response = client.post("/orders/", json=order_data)
        assert order_response.status_code == 201
        order = order_response.json()
        assert order["total"] == 199.98
        assert order["status"] == "pending"
        order_id = order["id"]

        # Process payment
        payment_data = {
            "method": "credit_card",
            "amount": 199.98
        }
        payment_response = client.post(f"/orders/{order_id}/payment", json=payment_data)
        assert payment_response.status_code == 200

        # Check stock was reduced
        product_response = client.get(f"/products/{product_id}")
        updated_product = product_response.json()
        assert updated_product["stock"] == 8

        # Fulfill order
        fulfill_response = client.post(f"/orders/{order_id}/fulfill")
        assert fulfill_response.status_code == 200

        # Verify final order status
        final_order_response = client.get(f"/orders/{order_id}")
        final_order = final_order_response.json()
        assert final_order["status"] == "fulfilled"

# Database integration tests
class TestDatabaseIntegration:
    def test_database_relationships(self):
        db = TestingSessionLocal()
        try:
            # Create user
            user = User(name="John Doe", email="john@example.com", password="hashed")
            db.add(user)
            db.commit()
            db.refresh(user)

            # Create product
            product = Product(name="Test Product", price=50.0, stock=10)
            db.add(product)
            db.commit()
            db.refresh(product)

            # Create order
            order = Order(user_id=user.id, total=100.0, status="pending")
            db.add(order)
            db.commit()
            db.refresh(order)

            # Test relationships
            assert order.user.id == user.id
            assert order.user.name == "John Doe"

            # Test cascade delete
            user_orders_count = db.query(Order).filter(Order.user_id == user.id).count()
            assert user_orders_count == 1

        finally:
            db.close()

    def test_database_transactions(self):
        db = TestingSessionLocal()
        try:
            # Start transaction
            user = User(name="Transaction User", email="trans@example.com", password="pass")
            db.add(user)
            db.flush()  # Get ID without committing

            order = Order(user_id=user.id, total=150.0, status="pending")
            db.add(order)

            # Rollback transaction
            db.rollback()

            # Verify nothing was committed
            users_count = db.query(User).count()
            orders_count = db.query(Order).count()
            assert users_count == 0
            assert orders_count == 0

        finally:
            db.close()
```

## Frontend Integration Testing

### React Integration Testing

```javascript
// tests/integration/App.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import App from '../../src/App';

// Mock API server
const server = setupServer(
  // Login endpoint
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;

    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid credentials' })
    );
  }),

  // Users endpoint
  rest.get('/api/users', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
    }

    return res(
      ctx.json({
        users: [
          { id: 1, name: 'Test User', email: 'test@example.com' },
          { id: 2, name: 'Another User', email: 'another@example.com' }
        ]
      })
    );
  }),

  // Create user endpoint
  rest.post('/api/users', (req, res, ctx) => {
    const { name, email } = req.body;

    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name,
        email,
        createdAt: new Date().toISOString()
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const AppWithProviders = () => (
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

describe('App Integration Tests', () => {
  test('complete user authentication flow', async () => {
    const user = userEvent.setup();
    render(<AppWithProviders />);

    // Should show login form initially
    expect(screen.getByText('Login')).toBeInTheDocument();

    // Fill in login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Should redirect to dashboard after successful login
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Should show user info
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
  });

  test('user management workflow', async () => {
    const user = userEvent.setup();
    render(<AppWithProviders />);

    // Login first
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Navigate to users page
    await user.click(screen.getByText('Users'));

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    // Should load and display users
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Another User')).toBeInTheDocument();
    });

    // Add new user
    await user.click(screen.getByText('Add User'));

    await user.type(screen.getByLabelText(/name/i), 'New User');
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Should show success message and new user
    await waitFor(() => {
      expect(screen.getByText('User created successfully')).toBeInTheDocument();
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
  });

  test('error handling', async () => {
    const user = userEvent.setup();
    render(<AppWithProviders />);

    // Try login with invalid credentials
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    // Should stay on login page
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
```

## Microservices Integration Testing

### Testing Service Communication

```javascript
// tests/integration/microservices.test.js
const request = require('supertest');
const Docker = require('dockerode');

describe('Microservices Integration Tests', () => {
  let docker;
  let containers = {};

  beforeAll(async () => {
    docker = new Docker();

    // Start required services
    const services = [
      {
        name: 'user-service',
        image: 'user-service:latest',
        port: 3001
      },
      {
        name: 'order-service',
        image: 'order-service:latest',
        port: 3002
      },
      {
        name: 'notification-service',
        image: 'notification-service:latest',
        port: 3003
      }
    ];

    for (const service of services) {
      const container = await docker.createContainer({
        Image: service.image,
        name: service.name,
        ExposedPorts: {
          [`${service.port}/tcp`]: {}
        },
        HostConfig: {
          PortBindings: {
            [`${service.port}/tcp`]: [{ HostPort: service.port.toString() }]
          }
        },
        Env: [
          'NODE_ENV=test',
          'DB_HOST=localhost',
          'REDIS_HOST=localhost'
        ]
      });

      await container.start();
      containers[service.name] = container;

      // Wait for service to be ready
      await waitForService(`http://localhost:${service.port}/health`);
    }
  }, 60000);

  afterAll(async () => {
    // Stop and remove containers
    for (const container of Object.values(containers)) {
      await container.stop();
      await container.remove();
    }
  });

  test('cross-service order processing', async () => {
    // Create user via user-service
    const userResponse = await request('http://localhost:3001')
      .post('/api/users')
      .send({
        name: 'Integration Test User',
        email: 'integration@example.com',
        password: 'password123'
      })
      .expect(201);

    const userId = userResponse.body.id;

    // Create order via order-service
    const orderResponse = await request('http://localhost:3002')
      .post('/api/orders')
      .send({
        userId: userId,
        items: [
          { productId: 1, quantity: 2, price: 50.00 }
        ]
      })
      .expect(201);

    const orderId = orderResponse.body.id;

    // Process order (should trigger notification)
    await request('http://localhost:3002')
      .post(`/api/orders/${orderId}/process`)
      .expect(200);

    // Wait for async notification processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check notification was sent
    const notificationResponse = await request('http://localhost:3003')
      .get(`/api/notifications/user/${userId}`)
      .expect(200);

    expect(notificationResponse.body.notifications).toHaveLength(1);
    expect(notificationResponse.body.notifications[0].type).toBe('order_processed');
    expect(notificationResponse.body.notifications[0].orderId).toBe(orderId);
  });

  test('service resilience and circuit breaker', async () => {
    // Stop order-service to simulate failure
    await containers['order-service'].stop();

    // User service should handle order service being down gracefully
    const userResponse = await request('http://localhost:3001')
      .get('/api/users/1/orders')
      .expect(503); // Service unavailable

    expect(userResponse.body.error).toBe('Order service unavailable');

    // Restart order-service
    await containers['order-service'].start();
    await waitForService('http://localhost:3002/health');

    // Should work again after service is back
    await request('http://localhost:3001')
      .get('/api/users/1/orders')
      .expect(200);
  });
});

async function waitForService(url, timeout = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Service not ready yet
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(`Service at ${url} did not become ready within ${timeout}ms`);
}
```

## Best Practices

### Test Data Management

```javascript
// utils/testDataFactory.js
class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      ...overrides
    };
  }

  static createProduct(overrides = {}) {
    return {
      name: 'Test Product',
      price: 99.99,
      stock: 10,
      category: 'Electronics',
      ...overrides
    };
  }

  static createOrder(userId, productId, overrides = {}) {
    return {
      userId,
      items: [
        {
          productId,
          quantity: 1,
          price: 99.99
        }
      ],
      status: 'pending',
      ...overrides
    };
  }

  static async seedDatabase(db) {
    // Create test users
    const users = await Promise.all([
      db.users.create(this.createUser({ email: 'user1@example.com' })),
      db.users.create(this.createUser({ email: 'user2@example.com' })),
      db.users.create(this.createUser({ email: 'admin@example.com', role: 'admin' }))
    ]);

    // Create test products
    const products = await Promise.all([
      db.products.create(this.createProduct({ name: 'Product 1', price: 50.00 })),
      db.products.create(this.createProduct({ name: 'Product 2', price: 75.00 })),
      db.products.create(this.createProduct({ name: 'Product 3', price: 100.00 }))
    ]);

    return { users, products };
  }
}

module.exports = TestDataFactory;
```

### Environment Configuration

```javascript
// config/test.js
module.exports = {
  database: {
    url: process.env.TEST_DATABASE_URL || 'sqlite::memory:',
    logging: false,
    synchronize: true,
    dropSchema: true
  },

  redis: {
    host: process.env.TEST_REDIS_HOST || 'localhost',
    port: process.env.TEST_REDIS_PORT || 6379,
    db: 1  // Use different DB for tests
  },

  services: {
    userService: process.env.TEST_USER_SERVICE_URL || 'http://localhost:3001',
    orderService: process.env.TEST_ORDER_SERVICE_URL || 'http://localhost:3002',
    notificationService: process.env.TEST_NOTIFICATION_SERVICE_URL || 'http://localhost:3003'
  },

  timeouts: {
    api: 5000,
    database: 3000,
    service: 10000
  }
};
```

## CI/CD Integration

### GitHub Actions for Integration Tests

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run database migrations
      run: npm run db:migrate
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db

    - name: Start services
      run: |
        npm run start:user-service &
        npm run start:order-service &
        npm run start:notification-service &
        sleep 10

    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: integration-test-results
        path: |
          coverage/
          test-results.xml
```

## Conclusion

Integration testing is crucial for ensuring that different parts of your system work together correctly. Key takeaways:

1. **Test realistic scenarios** that mirror production usage
2. **Use proper test environments** that match production
3. **Manage test data** carefully to ensure consistent results
4. **Test error scenarios** and edge cases
5. **Automate integration tests** in your CI/CD pipeline

Integration testing helps catch issues that unit tests miss and provides confidence that your system works as a whole.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).