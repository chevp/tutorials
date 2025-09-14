# Performance Testing Tutorial

## Introduction

Performance testing evaluates how well an application performs under various load conditions. It identifies bottlenecks, validates scalability, and ensures the application meets performance requirements before deployment to production.

## What is Performance Testing?

Performance testing is a type of non-functional testing that determines how responsive, stable, and scalable an application is under a given workload. It measures system performance metrics like response time, throughput, resource utilization, and stability.

### Types of Performance Testing

1. **Load Testing**: Normal expected load
2. **Stress Testing**: Beyond normal capacity
3. **Spike Testing**: Sudden increases in load
4. **Volume Testing**: Large amounts of data
5. **Endurance Testing**: Extended periods
6. **Scalability Testing**: Ability to scale up/down

## Key Performance Metrics

### Response Time Metrics
- **Average Response Time**: Mean time to complete requests
- **Median Response Time**: 50th percentile response time
- **95th Percentile**: 95% of requests complete within this time
- **99th Percentile**: 99% of requests complete within this time

### Throughput Metrics
- **Requests per Second (RPS)**: Number of requests handled per second
- **Transactions per Second (TPS)**: Business transactions per second
- **Pages per Second**: Web pages served per second

### Resource Utilization
- **CPU Usage**: Processor utilization percentage
- **Memory Usage**: RAM consumption
- **Disk I/O**: Read/write operations per second
- **Network I/O**: Bandwidth utilization

## Performance Testing Tools

| Tool | Type | Best For | Language |
|------|------|----------|----------|
| JMeter | Open Source | Web applications | Java |
| Artillery | Open Source | APIs, Node.js | JavaScript |
| K6 | Open Source | Developer-centric | JavaScript |
| LoadRunner | Commercial | Enterprise applications | Multiple |
| Gatling | Open Source | High performance | Scala |
| Locust | Open Source | Python applications | Python |

## Artillery Performance Testing

### Installation and Setup

```bash
# Install Artillery
npm install -g artillery

# Create test configuration
mkdir performance-tests
cd performance-tests
```

### Basic Load Testing

```yaml
# basic-load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 300
      arrivalRate: 20
      name: "Steady load"
    - duration: 120
      arrivalRate: 50
      name: "Peak load"
  defaults:
    headers:
      Accept: 'application/json'
      Content-Type: 'application/json'
  variables:
    testUserId:
      - 1
      - 2
      - 3
      - 4
      - 5

scenarios:
  - name: "API Load Test"
    weight: 70
    flow:
      - get:
          url: "/api/health"
      - think: 2
      - get:
          url: "/api/users/{{ testUserId }}"
      - think: 1
      - post:
          url: "/api/users/{{ testUserId }}/activity"
          json:
            action: "page_view"
            timestamp: "{{ $timestamp }}"

  - name: "Heavy Operations"
    weight: 30
    flow:
      - post:
          url: "/api/reports/generate"
          json:
            type: "monthly"
            userId: "{{ testUserId }}"
      - get:
          url: "/api/search"
          qs:
            q: "performance testing"
            limit: 50
```

```bash
# Run the test
artillery run basic-load-test.yml

# Run with custom target
artillery run --target http://staging.example.com basic-load-test.yml

# Generate HTML report
artillery run basic-load-test.yml --output results.json
artillery report --output report.html results.json
```

### Advanced Artillery Configuration

```yaml
# advanced-load-test.yml
config:
  target: 'http://localhost:3000'
  http:
    timeout: 30
    pool: 50  # Connection pooling
  phases:
    - duration: 60
      arrivalRate: 10
      maxVusers: 100
    - duration: 300
      arrivalRate: 50
      maxVusers: 500
    - duration: 180
      arrivalRate: 100
      maxVusers: 1000
  processor: "./custom-functions.js"
  plugins:
    metrics-by-endpoint:
      useOnlyRequestNames: true

scenarios:
  - name: "User Journey"
    weight: 100
    flow:
      # Login
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ generateEmail() }}"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"

      # Set auth header for subsequent requests
      - function: "setAuthHeader"

      # Browse products
      - get:
          url: "/api/products"
          qs:
            page: "{{ $randomInt(1, 10) }}"
            category: "{{ $pick(['electronics', 'clothing', 'books']) }}"
          expect:
            - statusCode: 200
            - hasProperty: "products"

      # View product details
      - get:
          url: "/api/products/{{ $randomInt(1, 1000) }}"
          expect:
            - statusCode: [200, 404]

      # Add to cart (conditional)
      - function: "maybeAddToCart"

      # Checkout flow (10% of users)
      - function: "maybeCheckout"

  - name: "Admin Operations"
    weight: 10
    flow:
      # Admin login
      - post:
          url: "/api/auth/admin-login"
          json:
            email: "admin@example.com"
            password: "admin123"
          capture:
            - json: "$.token"
              as: "adminToken"

      # Generate reports
      - get:
          url: "/api/admin/reports/sales"
          headers:
            Authorization: "Bearer {{ adminToken }}"
          qs:
            startDate: "2024-01-01"
            endDate: "2024-12-31"
```

```javascript
// custom-functions.js
module.exports = {
  generateEmail,
  setAuthHeader,
  maybeAddToCart,
  maybeCheckout
};

function generateEmail(context, events, done) {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  context.vars.email = `user${randomNum}_${timestamp}@example.com`;
  return done();
}

function setAuthHeader(context, events, done) {
  if (context.vars.authToken) {
    context.vars.$processInstructions = context.vars.$processInstructions || {};
    context.vars.$processInstructions.headers = context.vars.$processInstructions.headers || {};
    context.vars.$processInstructions.headers.Authorization = `Bearer ${context.vars.authToken}`;
  }
  return done();
}

function maybeAddToCart(context, events, done) {
  // 30% chance to add to cart
  if (Math.random() < 0.3) {
    const productId = Math.floor(Math.random() * 1000) + 1;
    const quantity = Math.floor(Math.random() * 3) + 1;

    context.vars.productId = productId;
    context.vars.quantity = quantity;

    // Make add to cart request
    events.emit('request', {
      url: '/api/cart/add',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.vars.authToken}`,
        'Content-Type': 'application/json'
      },
      json: {
        productId: productId,
        quantity: quantity
      }
    });
  }
  return done();
}

function maybeCheckout(context, events, done) {
  // 10% chance to proceed to checkout
  if (Math.random() < 0.1) {
    // Simulate checkout process
    events.emit('request', {
      url: '/api/checkout',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.vars.authToken}`,
        'Content-Type': 'application/json'
      },
      json: {
        paymentMethod: 'credit_card',
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          zip: '12345'
        }
      }
    });
  }
  return done();
}
```

## K6 Performance Testing

### Installation and Basic Usage

```bash
# Install k6
# macOS
brew install k6

# Windows
choco install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### K6 Load Testing Scripts

```javascript
// basic-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTimetrend = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 20 }, // Ramp-up
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 50 }, // Ramp-up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 0 },  // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
    checks: ['rate>0.9'],             // 90% of checks should pass
  },
};

export default function () {
  const baseUrl = 'http://localhost:3000';

  // Test homepage
  const homeResponse = http.get(`${baseUrl}/`);
  check(homeResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // Test API endpoint
  const apiResponse = http.get(`${baseUrl}/api/health`);
  check(apiResponse, {
    'API status is 200': (r) => r.status === 200,
    'API response has status': (r) => JSON.parse(r.body).status === 'ok',
  });

  // Record custom metrics
  errorRate.add(apiResponse.status !== 200);
  responseTimetrend.add(apiResponse.timings.duration);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'results.html': htmlReport(data),
    'results.json': JSON.stringify(data),
  };
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>K6 Performance Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; }
        .pass { border-left: 5px solid #4CAF50; }
        .fail { border-left: 5px solid #f44336; }
    </style>
</head>
<body>
    <h1>Performance Test Results</h1>
    <div class="metric ${data.metrics.http_req_duration.values.p95 < 500 ? 'pass' : 'fail'}">
        <h3>Response Time (95th percentile)</h3>
        <p>${data.metrics.http_req_duration.values.p95.toFixed(2)}ms</p>
    </div>
    <div class="metric ${data.metrics.http_req_failed.values.rate < 0.1 ? 'pass' : 'fail'}">
        <h3>Error Rate</h3>
        <p>${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</p>
    </div>
    <div class="metric">
        <h3>Total Requests</h3>
        <p>${data.metrics.http_reqs.values.count}</p>
    </div>
    <div class="metric">
        <h3>Requests per Second</h3>
        <p>${data.metrics.http_reqs.values.rate.toFixed(2)}</p>
    </div>
</body>
</html>
  `;
}
```

### Advanced K6 Testing

```javascript
// advanced-load-test.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Load test data
const users = new SharedArray('users', function () {
  return JSON.parse(open('./test-data/users.json'));
});

const products = new SharedArray('products', function () {
  return JSON.parse(open('./test-data/products.json'));
});

export const options = {
  scenarios: {
    // Constant load
    constant_load: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      tags: { scenario: 'constant' },
    },

    // Ramping load
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '3m', target: 0 },
      ],
      tags: { scenario: 'ramping' },
    },

    // Spike testing
    spike_test: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 500,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '30s', target: 200 }, // Spike
        { duration: '1m', target: 50 },
      ],
      tags: { scenario: 'spike' },
    },
  },

  thresholds: {
    http_req_duration: [
      'p(50)<200',
      'p(95)<500',
      'p(99)<800',
    ],
    http_req_failed: ['rate<0.05'],
    checks: ['rate>0.95'],

    // Scenario-specific thresholds
    'http_req_duration{scenario:constant}': ['p(95)<400'],
    'http_req_duration{scenario:spike}': ['p(95)<1000'],
  },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL || 'http://localhost:3000';
  const user = users[Math.floor(Math.random() * users.length)];
  let authToken;

  group('User Authentication', function () {
    const loginResponse = http.post(`${baseUrl}/api/auth/login`, {
      email: user.email,
      password: user.password,
    }, {
      headers: { 'Content-Type': 'application/json' },
      tags: { operation: 'login' },
    });

    check(loginResponse, {
      'login successful': (r) => r.status === 200,
      'login response time OK': (r) => r.timings.duration < 1000,
    });

    if (loginResponse.status === 200) {
      authToken = JSON.parse(loginResponse.body).token;
    }

    sleep(1);
  });

  if (authToken) {
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    group('Product Browsing', function () {
      // Browse products
      const productsResponse = http.get(`${baseUrl}/api/products`, {
        headers,
        tags: { operation: 'browse_products' },
      });

      check(productsResponse, {
        'products loaded': (r) => r.status === 200,
        'products response time OK': (r) => r.timings.duration < 500,
      });

      // View random product
      const product = products[Math.floor(Math.random() * products.length)];
      const productResponse = http.get(`${baseUrl}/api/products/${product.id}`, {
        headers,
        tags: { operation: 'view_product' },
      });

      check(productResponse, {
        'product details loaded': (r) => r.status === 200,
      });

      sleep(2);
    });

    group('Shopping Cart', function () {
      // Add to cart (30% chance)
      if (Math.random() < 0.3) {
        const product = products[Math.floor(Math.random() * products.length)];
        const addToCartResponse = http.post(`${baseUrl}/api/cart/add`, {
          productId: product.id,
          quantity: Math.floor(Math.random() * 3) + 1,
        }, {
          headers,
          tags: { operation: 'add_to_cart' },
        });

        check(addToCartResponse, {
          'item added to cart': (r) => r.status === 200,
        });

        // View cart
        const cartResponse = http.get(`${baseUrl}/api/cart`, {
          headers,
          tags: { operation: 'view_cart' },
        });

        check(cartResponse, {
          'cart loaded': (r) => r.status === 200,
        });
      }

      sleep(1);
    });

    group('Search Functionality', function () {
      const searchTerms = ['laptop', 'phone', 'book', 'shirt', 'shoes'];
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

      const searchResponse = http.get(`${baseUrl}/api/search?q=${term}&limit=20`, {
        headers,
        tags: { operation: 'search' },
      });

      check(searchResponse, {
        'search completed': (r) => r.status === 200,
        'search response time OK': (r) => r.timings.duration < 1000,
      });

      sleep(1);
    });

    // Checkout process (10% chance)
    if (Math.random() < 0.1) {
      group('Checkout Process', function () {
        const checkoutResponse = http.post(`${baseUrl}/api/checkout`, {
          paymentMethod: 'credit_card',
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            zip: '12345',
          },
        }, {
          headers,
          tags: { operation: 'checkout' },
        });

        check(checkoutResponse, {
          'checkout successful': (r) => r.status === 200,
          'checkout response time OK': (r) => r.timings.duration < 2000,
        });

        sleep(2);
      });
    }
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'results.html': htmlReport(data),
    'results.json': JSON.stringify(data, null, 2),
  };
}
```

## Apache JMeter

### JMeter Test Plan Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.2">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Web Application Performance Test">
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.arguments" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables">
        <collectionProp name="Arguments.arguments">
          <elementProp name="SERVER" elementType="Argument">
            <stringProp name="Argument.name">SERVER</stringProp>
            <stringProp name="Argument.value">localhost</stringProp>
          </elementProp>
          <elementProp name="PORT" elementType="Argument">
            <stringProp name="Argument.name">PORT</stringProp>
            <stringProp name="Argument.value">3000</stringProp>
          </elementProp>
        </collectionProp>
      </elementProp>
    </TestPlan>
    <hashTree>
      <!-- Thread Group Configuration -->
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Load Test Users">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <intProp name="LoopController.loops">10</intProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">50</stringProp>
        <stringProp name="ThreadGroup.ramp_time">60</stringProp>
      </ThreadGroup>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

### JMeter Command Line Usage

```bash
# Run JMeter test
jmeter -n -t load-test.jmx -l results.jtl -e -o reports/

# Run with custom properties
jmeter -n -t load-test.jmx -JSERVER=staging.example.com -JPORT=443 -l results.jtl

# Generate HTML report from existing results
jmeter -g results.jtl -o html-reports/
```

## Python Locust Testing

### Basic Locust Test

```python
# locustfile.py
from locust import HttpUser, task, between
import random
import json

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Called when a user starts"""
        self.login()

    def login(self):
        """Login user"""
        response = self.client.post("/api/auth/login", json={
            "email": f"user{random.randint(1, 1000)}@example.com",
            "password": "password123"
        })

        if response.status_code == 200:
            self.token = response.json().get("token")
            self.client.headers.update({"Authorization": f"Bearer {self.token}"})

    @task(3)
    def browse_products(self):
        """Browse products - most common action"""
        self.client.get("/api/products", params={
            "page": random.randint(1, 10),
            "category": random.choice(["electronics", "clothing", "books"])
        })

    @task(2)
    def view_product(self):
        """View individual product"""
        product_id = random.randint(1, 1000)
        self.client.get(f"/api/products/{product_id}")

    @task(1)
    def search_products(self):
        """Search for products"""
        search_terms = ["laptop", "phone", "book", "shirt", "shoes"]
        term = random.choice(search_terms)

        self.client.get("/api/search", params={
            "q": term,
            "limit": 20
        })

    @task(1)
    def add_to_cart(self):
        """Add item to cart"""
        self.client.post("/api/cart/add", json={
            "productId": random.randint(1, 1000),
            "quantity": random.randint(1, 3)
        })

    @task(1)
    def view_cart(self):
        """View shopping cart"""
        self.client.get("/api/cart")

class AdminUser(HttpUser):
    wait_time = between(5, 10)
    weight = 1  # Much fewer admin users

    def on_start(self):
        """Admin login"""
        response = self.client.post("/api/auth/admin-login", json={
            "email": "admin@example.com",
            "password": "admin123"
        })

        if response.status_code == 200:
            self.token = response.json().get("token")
            self.client.headers.update({"Authorization": f"Bearer {self.token}"})

    @task(2)
    def view_dashboard(self):
        """View admin dashboard"""
        self.client.get("/api/admin/dashboard")

    @task(1)
    def generate_report(self):
        """Generate sales report"""
        self.client.post("/api/admin/reports/generate", json={
            "type": "sales",
            "period": "monthly"
        })

    @task(1)
    def manage_users(self):
        """User management operations"""
        self.client.get("/api/admin/users", params={
            "page": 1,
            "limit": 50
        })

# Custom test configuration
class WebsitePerformanceTest(WebsiteUser):
    """Performance test with specific scenarios"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_id = None

    @task
    def complete_purchase_flow(self):
        """Complete end-to-end purchase"""
        # Browse products
        products_response = self.client.get("/api/products")

        if products_response.status_code == 200:
            products = products_response.json().get("products", [])

            if products:
                # Select random product
                product = random.choice(products)

                # Add to cart
                cart_response = self.client.post("/api/cart/add", json={
                    "productId": product["id"],
                    "quantity": 1
                })

                if cart_response.status_code == 200:
                    # Proceed to checkout
                    checkout_response = self.client.post("/api/checkout", json={
                        "paymentMethod": "credit_card",
                        "shippingAddress": {
                            "street": "123 Test St",
                            "city": "Test City",
                            "zip": "12345"
                        }
                    })

                    # Track conversion success
                    if checkout_response.status_code == 200:
                        print("Purchase completed successfully")
```

### Running Locust Tests

```bash
# Start Locust web UI
locust -f locustfile.py --host=http://localhost:3000

# Run headless with specific users and duration
locust -f locustfile.py --host=http://localhost:3000 --users 100 --spawn-rate 10 --run-time 5m

# Generate HTML report
locust -f locustfile.py --host=http://localhost:3000 --users 100 --spawn-rate 10 --run-time 5m --html=report.html

# Run with multiple user classes
locust -f locustfile.py WebsiteUser AdminUser --host=http://localhost:3000
```

## Database Performance Testing

### SQL Performance Testing

```python
# db_performance_test.py
import time
import psycopg2
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import statistics

class DatabasePerformanceTest:
    def __init__(self, connection_string, max_connections=20):
        self.connection_string = connection_string
        self.max_connections = max_connections
        self.results = []

    def create_connection(self):
        """Create database connection"""
        return psycopg2.connect(self.connection_string)

    def simple_query_test(self, iterations=1000):
        """Test simple SELECT queries"""
        conn = self.create_connection()
        cursor = conn.cursor()

        times = []

        for _ in range(iterations):
            start_time = time.time()
            cursor.execute("SELECT COUNT(*) FROM users WHERE active = true")
            result = cursor.fetchone()
            end_time = time.time()

            times.append((end_time - start_time) * 1000)  # Convert to ms

        cursor.close()
        conn.close()

        return {
            'avg_time': statistics.mean(times),
            'median_time': statistics.median(times),
            'p95_time': statistics.quantiles(times, n=20)[18],  # 95th percentile
            'max_time': max(times),
            'min_time': min(times)
        }

    def complex_query_test(self, iterations=100):
        """Test complex queries with joins"""
        conn = self.create_connection()
        cursor = conn.cursor()

        query = """
        SELECT
            u.id,
            u.name,
            COUNT(o.id) as order_count,
            SUM(o.total) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.created_at >= %s
        GROUP BY u.id, u.name
        HAVING COUNT(o.id) > 0
        ORDER BY total_spent DESC
        LIMIT 100
        """

        times = []

        for _ in range(iterations):
            start_time = time.time()
            cursor.execute(query, ('2023-01-01',))
            results = cursor.fetchall()
            end_time = time.time()

            times.append((end_time - start_time) * 1000)

        cursor.close()
        conn.close()

        return {
            'avg_time': statistics.mean(times),
            'median_time': statistics.median(times),
            'p95_time': statistics.quantiles(times, n=20)[18],
        }

    def concurrent_read_test(self, concurrent_users=10, queries_per_user=100):
        """Test concurrent read operations"""

        def user_queries():
            conn = self.create_connection()
            cursor = conn.cursor()
            user_times = []

            for _ in range(queries_per_user):
                start_time = time.time()
                cursor.execute("SELECT * FROM products WHERE price > %s LIMIT 10", (50,))
                results = cursor.fetchall()
                end_time = time.time()

                user_times.append((end_time - start_time) * 1000)

            cursor.close()
            conn.close()

            return user_times

        with ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = [executor.submit(user_queries) for _ in range(concurrent_users)]
            all_times = []

            for future in as_completed(futures):
                all_times.extend(future.result())

        return {
            'total_queries': len(all_times),
            'avg_time': statistics.mean(all_times),
            'median_time': statistics.median(all_times),
            'p95_time': statistics.quantiles(all_times, n=20)[18],
            'throughput': len(all_times) / max(all_times) * 1000  # queries per second
        }

    def write_performance_test(self, iterations=1000):
        """Test write operations performance"""
        conn = self.create_connection()
        cursor = conn.cursor()

        times = []

        for i in range(iterations):
            start_time = time.time()
            cursor.execute(
                "INSERT INTO test_table (name, value, created_at) VALUES (%s, %s, %s)",
                (f"test_{i}", i, time.time())
            )
            conn.commit()
            end_time = time.time()

            times.append((end_time - start_time) * 1000)

        cursor.close()
        conn.close()

        return {
            'avg_time': statistics.mean(times),
            'median_time': statistics.median(times),
            'throughput': 1000 / statistics.mean(times) * 1000  # operations per second
        }

# Usage
if __name__ == "__main__":
    test = DatabasePerformanceTest("postgresql://user:pass@localhost/testdb")

    print("Running simple query test...")
    simple_results = test.simple_query_test()
    print(f"Simple Query Results: {simple_results}")

    print("Running complex query test...")
    complex_results = test.complex_query_test()
    print(f"Complex Query Results: {complex_results}")

    print("Running concurrent read test...")
    concurrent_results = test.concurrent_read_test()
    print(f"Concurrent Read Results: {concurrent_results}")
```

## Frontend Performance Testing

### Lighthouse Performance Testing

```javascript
// lighthouse-perf-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;

class LighthousePerformanceTest {
  constructor(urls) {
    this.urls = urls;
    this.results = [];
  }

  async runTest() {
    for (const url of this.urls) {
      console.log(`Testing ${url}...`);

      const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance'],
        port: chrome.port,
      };

      const runnerResult = await lighthouse(url, options);
      await chrome.kill();

      const performanceScore = runnerResult.audits.performance.score * 100;
      const metrics = {
        url,
        performanceScore,
        firstContentfulPaint: runnerResult.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: runnerResult.audits['largest-contentful-paint'].numericValue,
        firstMeaningfulPaint: runnerResult.audits['first-meaningful-paint'].numericValue,
        speedIndex: runnerResult.audits['speed-index'].numericValue,
        timeToInteractive: runnerResult.audits['interactive'].numericValue,
        totalBlockingTime: runnerResult.audits['total-blocking-time'].numericValue,
        cumulativeLayoutShift: runnerResult.audits['cumulative-layout-shift'].numericValue,
      };

      this.results.push(metrics);

      // Save detailed report
      const reportFilename = `lighthouse-${url.replace(/[^\w]/g, '_')}-${Date.now()}.json`;
      await fs.writeFile(reportFilename, JSON.stringify(runnerResult, null, 2));
    }

    return this.results;
  }

  generateReport() {
    const report = {
      summary: {
        totalPages: this.results.length,
        averagePerformanceScore: this.results.reduce((sum, r) => sum + r.performanceScore, 0) / this.results.length,
        averageFCP: this.results.reduce((sum, r) => sum + r.firstContentfulPaint, 0) / this.results.length,
        averageLCP: this.results.reduce((sum, r) => sum + r.largestContentfulPaint, 0) / this.results.length,
      },
      details: this.results
    };

    return report;
  }
}

// Usage
async function runPerformanceTests() {
  const urls = [
    'http://localhost:3000',
    'http://localhost:3000/products',
    'http://localhost:3000/checkout',
  ];

  const test = new LighthousePerformanceTest(urls);
  await test.runTest();

  const report = test.generateReport();

  console.log('Performance Test Summary:');
  console.log(`Average Performance Score: ${report.summary.averagePerformanceScore.toFixed(2)}`);
  console.log(`Average First Contentful Paint: ${report.summary.averageFCP.toFixed(2)}ms`);
  console.log(`Average Largest Contentful Paint: ${report.summary.averageLCP.toFixed(2)}ms`);

  // Save report
  await fs.writeFile('performance-report.json', JSON.stringify(report, null, 2));
}

runPerformanceTests().catch(console.error);
```

## CI/CD Integration

### GitHub Actions for Performance Testing

```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:
  push:
    branches: [ main ]
    paths:
      - 'src/**'
      - 'performance-tests/**'

jobs:
  performance-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build

    - name: Start application
      run: |
        npm start &
        npx wait-on http://localhost:3000 --timeout 60000
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/testdb
        NODE_ENV: production

    - name: Install performance testing tools
      run: |
        npm install -g artillery
        pip install locust

    - name: Run Artillery load tests
      run: |
        cd performance-tests
        artillery run --output results.json load-test.yml
        artillery report --output artillery-report.html results.json

    - name: Run K6 performance tests
      uses: grafana/k6-action@v0.3.1
      with:
        filename: performance-tests/k6-load-test.js
      env:
        TARGET_URL: http://localhost:3000

    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

    - name: Performance regression check
      run: |
        node performance-tests/check-regression.js

    - name: Upload performance results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: performance-test-results
        path: |
          performance-tests/results/
          artillery-report.html
          lighthouse-reports/

    - name: Comment PR with results
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const results = JSON.parse(fs.readFileSync('performance-tests/results/summary.json'));

          const comment = `
          ## Performance Test Results 📊

          - **Average Response Time**: ${results.avgResponseTime}ms
          - **95th Percentile**: ${results.p95ResponseTime}ms
          - **Requests/Second**: ${results.throughput}
          - **Error Rate**: ${results.errorRate}%

          ${results.regressionDetected ? '⚠️ **Performance regression detected!**' : '✅ No performance regressions detected'}

          [View detailed report](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})
          `;

          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });
```

## Performance Monitoring and Analysis

### Custom Performance Metrics Collection

```javascript
// performance-monitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.thresholds = {
      responseTime: 500,
      errorRate: 0.05,
      throughput: 100
    };
  }

  recordMetric(metric) {
    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    });
  }

  analyzeResults() {
    const responseTimes = this.metrics.map(m => m.responseTime).filter(Boolean);
    const errors = this.metrics.filter(m => m.error).length;
    const total = this.metrics.length;

    const analysis = {
      avgResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      p95ResponseTime: this.percentile(responseTimes, 95),
      p99ResponseTime: this.percentile(responseTimes, 99),
      errorRate: errors / total,
      throughput: total / ((Math.max(...this.metrics.map(m => m.timestamp)) - Math.min(...this.metrics.map(m => m.timestamp))) / 1000),
      totalRequests: total,
      errors: errors
    };

    // Check for regressions
    analysis.regressions = this.checkRegressions(analysis);

    return analysis;
  }

  percentile(arr, p) {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  checkRegressions(current) {
    const regressions = [];

    if (current.avgResponseTime > this.thresholds.responseTime) {
      regressions.push(`Average response time (${current.avgResponseTime.toFixed(2)}ms) exceeds threshold (${this.thresholds.responseTime}ms)`);
    }

    if (current.errorRate > this.thresholds.errorRate) {
      regressions.push(`Error rate (${(current.errorRate * 100).toFixed(2)}%) exceeds threshold (${this.thresholds.errorRate * 100}%)`);
    }

    if (current.throughput < this.thresholds.throughput) {
      regressions.push(`Throughput (${current.throughput.toFixed(2)} req/s) below threshold (${this.thresholds.throughput} req/s)`);
    }

    return regressions;
  }

  generateReport() {
    const analysis = this.analyzeResults();

    const report = `
# Performance Test Report

## Summary
- **Total Requests**: ${analysis.totalRequests}
- **Average Response Time**: ${analysis.avgResponseTime.toFixed(2)}ms
- **95th Percentile**: ${analysis.p95ResponseTime.toFixed(2)}ms
- **99th Percentile**: ${analysis.p99ResponseTime.toFixed(2)}ms
- **Error Rate**: ${(analysis.errorRate * 100).toFixed(2)}%
- **Throughput**: ${analysis.throughput.toFixed(2)} req/s

## Performance Issues
${analysis.regressions.length === 0 ? 'No performance regressions detected ✅' : analysis.regressions.map(r => `- ${r}`).join('\n')}

## Recommendations
${this.generateRecommendations(analysis)}
    `;

    return report;
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.avgResponseTime > 300) {
      recommendations.push('Consider optimizing database queries and adding caching');
    }

    if (analysis.errorRate > 0.01) {
      recommendations.push('Investigate and fix the root cause of errors');
    }

    if (analysis.throughput < 50) {
      recommendations.push('Consider scaling up server resources or optimizing code');
    }

    return recommendations.length === 0 ? 'Performance looks good! 🎉' : recommendations.map(r => `- ${r}`).join('\n');
  }
}

module.exports = PerformanceMonitor;
```

## Best Practices

### Performance Testing Strategy

1. **Start Early**: Include performance testing from the beginning
2. **Test Realistic Scenarios**: Use production-like data and user patterns
3. **Monitor Key Metrics**: Focus on user-impacting metrics
4. **Set Clear Thresholds**: Define acceptable performance criteria
5. **Test Regularly**: Integrate into CI/CD pipeline
6. **Analyze Trends**: Track performance over time

### Common Pitfalls to Avoid

1. **Testing in Unrealistic Environments**: Use production-like infrastructure
2. **Ignoring Warm-up Time**: Allow applications to reach steady state
3. **Not Testing Edge Cases**: Include error scenarios and boundary conditions
4. **Overlooking Resource Monitoring**: Monitor CPU, memory, and disk usage
5. **Testing Only Happy Paths**: Include failure scenarios

## Conclusion

Performance testing is crucial for ensuring your application can handle expected load and provides a good user experience. By implementing comprehensive performance testing strategies with appropriate tools and monitoring, you can identify bottlenecks early and maintain optimal application performance.

Key takeaways:
- Choose the right tools for your technology stack
- Test early and often in your development cycle
- Monitor both application and infrastructure metrics
- Set realistic performance thresholds based on business requirements
- Integrate performance testing into your CI/CD pipeline

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).