# Unit Testing Tutorial

## Overview

Unit testing involves testing individual components or modules of software in isolation from the rest of the application. This tutorial covers unit testing principles, frameworks, best practices, and advanced testing techniques.

## Unit Testing Fundamentals

### What is Unit Testing?

Unit testing focuses on testing the smallest testable parts of an application, typically individual functions, methods, or classes. Key characteristics:

- **Isolation**: Tests run independently without external dependencies
- **Fast Execution**: Should run quickly to provide rapid feedback
- **Deterministic**: Same input should always produce same output
- **Automated**: Can be run automatically as part of CI/CD pipeline

### Test Structure (AAA Pattern)

```javascript
// Arrange - Set up test data and conditions
// Act - Execute the code being tested
// Assert - Verify the expected outcome

describe('Calculator', () => {
  test('should add two numbers correctly', () => {
    // Arrange
    const calculator = new Calculator();
    const a = 5;
    const b = 3;

    // Act
    const result = calculator.add(a, b);

    // Assert
    expect(result).toBe(8);
  });
});
```

## JavaScript/Node.js Unit Testing

### Jest Framework

**Installation and Setup**:

```json
{
  "name": "my-project",
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.{js,ts}",
      "!src/**/*.test.{js,ts}"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

**Basic Unit Tests**:

```javascript
// src/math.js
class MathOperations {
  add(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers');
    }
    return a + b;
  }

  divide(a, b) {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  }

  factorial(n) {
    if (n < 0) {
      throw new Error('Factorial is not defined for negative numbers');
    }
    if (n === 0 || n === 1) {
      return 1;
    }
    return n * this.factorial(n - 1);
  }

  isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }
}

module.exports = MathOperations;
```

```javascript
// src/math.test.js
const MathOperations = require('./math');

describe('MathOperations', () => {
  let math;

  beforeEach(() => {
    math = new MathOperations();
  });

  describe('add', () => {
    test('should add two positive numbers', () => {
      expect(math.add(2, 3)).toBe(5);
    });

    test('should add negative numbers', () => {
      expect(math.add(-2, -3)).toBe(-5);
    });

    test('should handle zero', () => {
      expect(math.add(0, 5)).toBe(5);
      expect(math.add(5, 0)).toBe(5);
    });

    test('should throw error for non-numeric inputs', () => {
      expect(() => math.add('a', 5)).toThrow('Both arguments must be numbers');
      expect(() => math.add(5, null)).toThrow('Both arguments must be numbers');
    });
  });

  describe('divide', () => {
    test('should divide numbers correctly', () => {
      expect(math.divide(10, 2)).toBe(5);
      expect(math.divide(7, 2)).toBe(3.5);
    });

    test('should throw error when dividing by zero', () => {
      expect(() => math.divide(5, 0)).toThrow('Cannot divide by zero');
    });

    test('should handle negative numbers', () => {
      expect(math.divide(-10, 2)).toBe(-5);
      expect(math.divide(10, -2)).toBe(-5);
    });
  });

  describe('factorial', () => {
    test('should calculate factorial correctly', () => {
      expect(math.factorial(0)).toBe(1);
      expect(math.factorial(1)).toBe(1);
      expect(math.factorial(5)).toBe(120);
    });

    test('should throw error for negative numbers', () => {
      expect(() => math.factorial(-1)).toThrow('Factorial is not defined for negative numbers');
    });

    test('should handle large numbers', () => {
      expect(math.factorial(10)).toBe(3628800);
    });
  });

  describe('isPrime', () => {
    test('should identify prime numbers', () => {
      expect(math.isPrime(2)).toBe(true);
      expect(math.isPrime(3)).toBe(true);
      expect(math.isPrime(17)).toBe(true);
      expect(math.isPrime(97)).toBe(true);
    });

    test('should identify non-prime numbers', () => {
      expect(math.isPrime(1)).toBe(false);
      expect(math.isPrime(4)).toBe(false);
      expect(math.isPrime(15)).toBe(false);
      expect(math.isPrime(100)).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(math.isPrime(0)).toBe(false);
      expect(math.isPrime(-5)).toBe(false);
    });
  });
});
```

### Mocking and Stubbing

**Mocking External Dependencies**:

```javascript
// src/user-service.js
const axios = require('axios');

class UserService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async getUser(userId) {
    try {
      const response = await axios.get(`${this.apiUrl}/users/${userId}`);
      return {
        success: true,
        user: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createUser(userData) {
    try {
      const response = await axios.post(`${this.apiUrl}/users`, userData);
      return {
        success: true,
        user: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = UserService;
```

```javascript
// src/user-service.test.js
const axios = require('axios');
const UserService = require('./user-service');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService('https://api.example.com');
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    test('should return user data when API call succeeds', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

      const result = await userService.getUser(1);

      expect(result).toEqual({
        success: true,
        user: mockUser
      });
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users/1');
    });

    test('should handle API errors gracefully', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      const result = await userService.getUser(1);

      expect(result).toEqual({
        success: false,
        error: errorMessage
      });
    });

    test('should handle 404 errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
        message: 'User not found'
      });

      const result = await userService.getUser(999);

      expect(result.success).toBe(false);
      expect(result.error).toContain('User not found');
    });
  });

  describe('createUser', () => {
    test('should create user successfully', async () => {
      const userData = { name: 'Jane Doe', email: 'jane@example.com' };
      const createdUser = { id: 2, ...userData };
      mockedAxios.post.mockResolvedValueOnce({ data: createdUser });

      const result = await userService.createUser(userData);

      expect(result).toEqual({
        success: true,
        user: createdUser
      });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.example.com/users',
        userData
      );
    });

    test('should handle validation errors', async () => {
      const userData = { name: 'Jane Doe', email: 'invalid-email' };
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 400 },
        message: 'Invalid email format'
      });

      const result = await userService.createUser(userData);

      expect(result.success).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('should validate correct email formats', () => {
      expect(userService.validateEmail('test@example.com')).toBe(true);
      expect(userService.validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(userService.validateEmail('user+tag@example.org')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(userService.validateEmail('invalid-email')).toBe(false);
      expect(userService.validateEmail('test@')).toBe(false);
      expect(userService.validateEmail('@example.com')).toBe(false);
      expect(userService.validateEmail('')).toBe(false);
    });
  });
});
```

### Testing Asynchronous Code

```javascript
// src/async-operations.js
class AsyncOperations {
  async fetchData(url) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (url.includes('error')) {
          reject(new Error('Fetch failed'));
        } else {
          resolve({ data: 'mock data', url });
        }
      }, 100);
    });
  }

  async processMultipleUrls(urls) {
    const results = [];
    for (const url of urls) {
      try {
        const result = await this.fetchData(url);
        results.push(result);
      } catch (error) {
        results.push({ error: error.message, url });
      }
    }
    return results;
  }

  async fetchWithTimeout(url, timeout = 1000) {
    return Promise.race([
      this.fetchData(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }
}

module.exports = AsyncOperations;
```

```javascript
// src/async-operations.test.js
const AsyncOperations = require('./async-operations');

describe('AsyncOperations', () => {
  let asyncOps;

  beforeEach(() => {
    asyncOps = new AsyncOperations();
  });

  describe('fetchData', () => {
    test('should fetch data successfully', async () => {
      const url = 'https://api.example.com/data';
      const result = await asyncOps.fetchData(url);

      expect(result).toEqual({
        data: 'mock data',
        url: url
      });
    });

    test('should handle fetch errors', async () => {
      const url = 'https://api.example.com/error';

      await expect(asyncOps.fetchData(url)).rejects.toThrow('Fetch failed');
    });

    test('should resolve within expected time', async () => {
      const startTime = Date.now();
      await asyncOps.fetchData('https://api.example.com/data');
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('processMultipleUrls', () => {
    test('should process multiple URLs', async () => {
      const urls = [
        'https://api.example.com/data1',
        'https://api.example.com/data2'
      ];

      const results = await asyncOps.processMultipleUrls(urls);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        data: 'mock data',
        url: urls[0]
      });
      expect(results[1]).toEqual({
        data: 'mock data',
        url: urls[1]
      });
    });

    test('should handle mixed success and error URLs', async () => {
      const urls = [
        'https://api.example.com/data',
        'https://api.example.com/error'
      ];

      const results = await asyncOps.processMultipleUrls(urls);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        data: 'mock data',
        url: urls[0]
      });
      expect(results[1]).toEqual({
        error: 'Fetch failed',
        url: urls[1]
      });
    });
  });

  describe('fetchWithTimeout', () => {
    test('should complete before timeout', async () => {
      const result = await asyncOps.fetchWithTimeout('https://api.example.com/data', 200);

      expect(result).toEqual({
        data: 'mock data',
        url: 'https://api.example.com/data'
      });
    });

    test('should timeout when operation takes too long', async () => {
      await expect(
        asyncOps.fetchWithTimeout('https://api.example.com/data', 50)
      ).rejects.toThrow('Timeout');
    });
  });
});
```

## Python Unit Testing

### unittest Framework

```python
# src/calculator.py
class Calculator:
    def add(self, a, b):
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise TypeError("Arguments must be numbers")
        return a + b

    def divide(self, a, b):
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

    def power(self, base, exponent):
        if not isinstance(base, (int, float)) or not isinstance(exponent, (int, float)):
            raise TypeError("Arguments must be numbers")
        return base ** exponent

    def factorial(self, n):
        if not isinstance(n, int):
            raise TypeError("Argument must be an integer")
        if n < 0:
            raise ValueError("Factorial is not defined for negative numbers")
        if n == 0 or n == 1:
            return 1
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result
```

```python
# tests/test_calculator.py
import unittest
from src.calculator import Calculator

class TestCalculator(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.calculator = Calculator()

    def tearDown(self):
        """Tear down test fixtures after each test method."""
        pass

    def test_add_positive_numbers(self):
        """Test adding positive numbers."""
        result = self.calculator.add(3, 5)
        self.assertEqual(result, 8)

    def test_add_negative_numbers(self):
        """Test adding negative numbers."""
        result = self.calculator.add(-3, -5)
        self.assertEqual(result, -8)

    def test_add_mixed_numbers(self):
        """Test adding positive and negative numbers."""
        result = self.calculator.add(5, -3)
        self.assertEqual(result, 2)

    def test_add_with_zero(self):
        """Test adding with zero."""
        self.assertEqual(self.calculator.add(5, 0), 5)
        self.assertEqual(self.calculator.add(0, 5), 5)

    def test_add_floats(self):
        """Test adding floating point numbers."""
        result = self.calculator.add(3.14, 2.86)
        self.assertAlmostEqual(result, 6.0, places=7)

    def test_add_invalid_types(self):
        """Test adding with invalid types."""
        with self.assertRaises(TypeError):
            self.calculator.add("5", 3)
        with self.assertRaises(TypeError):
            self.calculator.add(5, None)

    def test_divide_normal_case(self):
        """Test normal division."""
        result = self.calculator.divide(10, 2)
        self.assertEqual(result, 5.0)

    def test_divide_by_zero(self):
        """Test division by zero raises ValueError."""
        with self.assertRaises(ValueError) as context:
            self.calculator.divide(5, 0)
        self.assertIn("Cannot divide by zero", str(context.exception))

    def test_divide_negative_numbers(self):
        """Test division with negative numbers."""
        self.assertEqual(self.calculator.divide(-10, 2), -5.0)
        self.assertEqual(self.calculator.divide(10, -2), -5.0)

    def test_power_positive_exponent(self):
        """Test power with positive exponent."""
        self.assertEqual(self.calculator.power(2, 3), 8)
        self.assertEqual(self.calculator.power(5, 2), 25)

    def test_power_zero_exponent(self):
        """Test power with zero exponent."""
        self.assertEqual(self.calculator.power(5, 0), 1)

    def test_power_negative_exponent(self):
        """Test power with negative exponent."""
        self.assertAlmostEqual(self.calculator.power(2, -3), 0.125, places=7)

    def test_factorial_base_cases(self):
        """Test factorial base cases."""
        self.assertEqual(self.calculator.factorial(0), 1)
        self.assertEqual(self.calculator.factorial(1), 1)

    def test_factorial_positive_numbers(self):
        """Test factorial with positive numbers."""
        self.assertEqual(self.calculator.factorial(5), 120)
        self.assertEqual(self.calculator.factorial(4), 24)

    def test_factorial_invalid_input(self):
        """Test factorial with invalid input."""
        with self.assertRaises(ValueError):
            self.calculator.factorial(-1)
        with self.assertRaises(TypeError):
            self.calculator.factorial(3.14)
        with self.assertRaises(TypeError):
            self.calculator.factorial("5")

if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)
```

### pytest Framework

```python
# Install pytest: pip install pytest pytest-cov

# tests/test_calculator_pytest.py
import pytest
from src.calculator import Calculator

class TestCalculator:
    def setup_method(self):
        """Setup method called before each test."""
        self.calculator = Calculator()

    def test_add_positive_numbers(self):
        assert self.calculator.add(3, 5) == 8

    def test_add_negative_numbers(self):
        assert self.calculator.add(-3, -5) == -8

    @pytest.mark.parametrize("a,b,expected", [
        (2, 3, 5),
        (-1, 1, 0),
        (0, 0, 0),
        (1.5, 2.5, 4.0)
    ])
    def test_add_parameterized(self, a, b, expected):
        assert self.calculator.add(a, b) == expected

    def test_add_invalid_types(self):
        with pytest.raises(TypeError, match="Arguments must be numbers"):
            self.calculator.add("5", 3)

    def test_divide_by_zero(self):
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            self.calculator.divide(5, 0)

    @pytest.mark.parametrize("base,exp,expected", [
        (2, 3, 8),
        (5, 0, 1),
        (3, 2, 9),
        (10, 1, 10)
    ])
    def test_power_parameterized(self, base, exp, expected):
        assert self.calculator.power(base, exp) == expected

    @pytest.fixture
    def sample_data(self):
        return [1, 2, 3, 4, 5]

    def test_with_fixture(self, sample_data):
        # Use fixture data in test
        assert len(sample_data) == 5
        assert sum(sample_data) == 15

# Run with: pytest tests/test_calculator_pytest.py -v
# Coverage: pytest tests/test_calculator_pytest.py --cov=src --cov-report=html
```

## Advanced Unit Testing Patterns

### Test Doubles (Mocks, Stubs, Fakes)

```javascript
// src/email-service.js
class EmailService {
  constructor(emailProvider, logger) {
    this.emailProvider = emailProvider;
    this.logger = logger;
  }

  async sendEmail(to, subject, body) {
    try {
      this.logger.info(`Sending email to ${to}`);

      const result = await this.emailProvider.send({
        to,
        subject,
        body,
        timestamp: new Date()
      });

      this.logger.info(`Email sent successfully to ${to}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendBulkEmails(emails) {
    const results = [];

    for (const email of emails) {
      const result = await this.sendEmail(email.to, email.subject, email.body);
      results.push({ ...email, ...result });
    }

    const successful = results.filter(r => r.success).length;
    this.logger.info(`Bulk email completed: ${successful}/${emails.length} successful`);

    return {
      total: emails.length,
      successful,
      failed: emails.length - successful,
      results
    };
  }
}

module.exports = EmailService;
```

```javascript
// src/email-service.test.js
const EmailService = require('./email-service');

describe('EmailService', () => {
  let emailService;
  let mockEmailProvider;
  let mockLogger;

  beforeEach(() => {
    // Create mock objects
    mockEmailProvider = {
      send: jest.fn()
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    };

    emailService = new EmailService(mockEmailProvider, mockLogger);
  });

  describe('sendEmail', () => {
    test('should send email successfully', async () => {
      // Arrange
      const mockResponse = { messageId: 'msg-123' };
      mockEmailProvider.send.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await emailService.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test Body'
      );

      // Assert
      expect(result).toEqual({
        success: true,
        messageId: 'msg-123'
      });

      expect(mockEmailProvider.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
        timestamp: expect.any(Date)
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Sending email to test@example.com');
      expect(mockLogger.info).toHaveBeenCalledWith('Email sent successfully to test@example.com');
    });

    test('should handle email provider errors', async () => {
      // Arrange
      const error = new Error('SMTP server unavailable');
      mockEmailProvider.send.mockRejectedValueOnce(error);

      // Act
      const result = await emailService.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test Body'
      );

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'SMTP server unavailable'
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to send email to test@example.com: SMTP server unavailable'
      );
    });

    test('should verify call counts and arguments', async () => {
      mockEmailProvider.send.mockResolvedValueOnce({ messageId: 'msg-456' });

      await emailService.sendEmail('user@test.com', 'Hello', 'World');

      // Verify exact number of calls
      expect(mockEmailProvider.send).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);

      // Verify call order
      expect(mockLogger.info).toHaveBeenNthCalledWith(1, 'Sending email to user@test.com');
      expect(mockLogger.info).toHaveBeenNthCalledWith(2, 'Email sent successfully to user@test.com');
    });
  });

  describe('sendBulkEmails', () => {
    test('should send multiple emails', async () => {
      // Arrange
      const emails = [
        { to: 'user1@test.com', subject: 'Subject 1', body: 'Body 1' },
        { to: 'user2@test.com', subject: 'Subject 2', body: 'Body 2' }
      ];

      mockEmailProvider.send
        .mockResolvedValueOnce({ messageId: 'msg-1' })
        .mockResolvedValueOnce({ messageId: 'msg-2' });

      // Act
      const result = await emailService.sendBulkEmails(emails);

      // Assert
      expect(result).toEqual({
        total: 2,
        successful: 2,
        failed: 0,
        results: [
          { to: 'user1@test.com', subject: 'Subject 1', body: 'Body 1', success: true, messageId: 'msg-1' },
          { to: 'user2@test.com', subject: 'Subject 2', body: 'Body 2', success: true, messageId: 'msg-2' }
        ]
      });

      expect(mockEmailProvider.send).toHaveBeenCalledTimes(2);
    });

    test('should handle partial failures', async () => {
      const emails = [
        { to: 'user1@test.com', subject: 'Subject 1', body: 'Body 1' },
        { to: 'user2@test.com', subject: 'Subject 2', body: 'Body 2' }
      ];

      mockEmailProvider.send
        .mockResolvedValueOnce({ messageId: 'msg-1' })
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await emailService.sendBulkEmails(emails);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toBe('Network error');
    });
  });
});
```

## Test Coverage and Quality Metrics

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.test.{js,ts}',
    '!src/index.js',
    '!src/config/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/critical/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  testMatch: [
    '**/__tests__/**/*.(js|ts)',
    '**/*.(test|spec).(js|ts)'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

### Quality Metrics and Reporting

```javascript
// tests/setup.js
// Global test setup and utilities

// Custom matchers
expect.extend({
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
      pass
    };
  },

  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () =>
        pass
          ? `expected ${received} not to be within range ${floor} - ${ceiling}`
          : `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass
    };
  }
});

// Global test helpers
global.testHelpers = {
  createMockUser: (overrides = {}) => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(),
    ...overrides
  }),

  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  randomString: (length = 10) =>
    Math.random().toString(36).substring(2, length + 2)
};
```

## Best Practices and Guidelines

### Test Organization

```javascript
// Good test organization
describe('UserManager', () => {
  // Group related tests
  describe('constructor', () => {
    test('should initialize with default values', () => {
      // Test implementation
    });

    test('should accept custom configuration', () => {
      // Test implementation
    });
  });

  describe('createUser', () => {
    describe('when valid data is provided', () => {
      test('should create user successfully', () => {
        // Test implementation
      });

      test('should return created user with generated ID', () => {
        // Test implementation
      });
    });

    describe('when invalid data is provided', () => {
      test('should throw error for missing required fields', () => {
        // Test implementation
      });

      test('should throw error for invalid email format', () => {
        // Test implementation
      });
    });
  });

  describe('updateUser', () => {
    // More grouped tests...
  });
});
```

### Writing Maintainable Tests

```javascript
// Use descriptive test names
test('should return 400 error when email is missing from user creation request', () => {
  // Implementation
});

// Use constants for test data
const VALID_USER_DATA = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
};

const INVALID_EMAIL_DATA = {
  ...VALID_USER_DATA,
  email: 'invalid-email'
};

// Create helper functions for common operations
const createUserService = (dependencies = {}) => {
  const defaultDeps = {
    userRepository: mockUserRepository,
    emailService: mockEmailService,
    logger: mockLogger
  };

  return new UserService({ ...defaultDeps, ...dependencies });
};

// Use setup and teardown appropriately
describe('Database Integration', () => {
  beforeAll(async () => {
    // One-time setup for all tests
    await database.connect();
  });

  afterAll(async () => {
    // One-time cleanup for all tests
    await database.disconnect();
  });

  beforeEach(async () => {
    // Setup before each test
    await database.clearTables();
    await database.seed();
  });

  afterEach(async () => {
    // Cleanup after each test
    await database.clearTables();
  });
});
```

Unit testing is fundamental to software quality. Focus on testing behavior rather than implementation, maintain high test coverage, use appropriate test doubles, and write tests that are fast, reliable, and maintainable.
## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
