# End-to-End Testing Tutorial

## Introduction

End-to-End (E2E) testing validates the entire application flow from start to finish, testing the system from the user's perspective. It ensures that all components work together correctly in a production-like environment.

## What is End-to-End Testing?

E2E testing simulates real user scenarios by testing the complete user journey through your application. It verifies that the integrated components of an application function as expected across the entire system.

### Benefits of E2E Testing

1. **Validates user workflows** from start to finish
2. **Tests real browser behavior** and interactions
3. **Catches integration issues** between frontend and backend
4. **Verifies third-party integrations**
5. **Provides confidence** in production deployments

## Popular E2E Testing Tools

| Tool | Language | Key Features | Best For |
|------|----------|-------------|----------|
| Cypress | JavaScript | Time-travel debugging, Real browser testing | Modern web apps |
| Playwright | JavaScript/Python | Cross-browser, Mobile testing | Multi-browser testing |
| Selenium | Multiple | Cross-browser, Mature ecosystem | Legacy applications |
| Puppeteer | JavaScript | Chrome DevTools Protocol | Chrome-specific testing |
| TestCafe | JavaScript | No WebDriver, Easy setup | Quick setup needs |

## Cypress E2E Testing

### Installation and Setup

```bash
# Install Cypress
npm install --save-dev cypress

# Open Cypress Test Runner
npx cypress open

# Run Cypress tests headlessly
npx cypress run
```

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      apiUrl: 'http://localhost:3001/api',
      testUser: {
        email: 'test@example.com',
        password: 'password123'
      }
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        resetDatabase() {
          // Reset database before tests
          return null;
        },
        seedDatabase() {
          // Seed database with test data
          return null;
        }
      });
    },
  },
});
```

### Basic E2E Test Examples

```javascript
// cypress/e2e/user-authentication.cy.js
describe('User Authentication', () => {
  beforeEach(() => {
    // Reset database before each test
    cy.task('resetDatabase');
    cy.visit('/');
  });

  it('should allow user to register, login, and logout', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    // Test user registration
    cy.get('[data-cy="register-link"]').click();
    cy.url().should('include', '/register');

    cy.get('[data-cy="name-input"]').type(user.name);
    cy.get('[data-cy="email-input"]').type(user.email);
    cy.get('[data-cy="password-input"]').type(user.password);
    cy.get('[data-cy="confirm-password-input"]').type(user.password);
    cy.get('[data-cy="register-button"]').click();

    // Should redirect to dashboard after registration
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="welcome-message"]').should('contain', user.name);

    // Test logout
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="logout-button"]').click();

    // Should redirect to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Test login with registered user
    cy.get('[data-cy="login-link"]').click();
    cy.get('[data-cy="email-input"]').type(user.email);
    cy.get('[data-cy="password-input"]').type(user.password);
    cy.get('[data-cy="login-button"]').click();

    // Should be logged in successfully
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="welcome-message"]').should('contain', user.name);
  });

  it('should show error for invalid login credentials', () => {
    cy.get('[data-cy="login-link"]').click();
    cy.get('[data-cy="email-input"]').type('invalid@example.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="login-button"]').click();

    cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');
    cy.url().should('include', '/login');
  });

  it('should prevent access to protected routes when not authenticated', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});
```

### E2E Shopping Cart Flow

```javascript
// cypress/e2e/shopping-cart.cy.js
describe('Shopping Cart Flow', () => {
  beforeEach(() => {
    cy.task('resetDatabase');
    cy.task('seedDatabase');

    // Login as test user
    cy.login(Cypress.env('testUser').email, Cypress.env('testUser').password);
  });

  it('should complete full shopping experience', () => {
    // Browse products
    cy.visit('/products');
    cy.get('[data-cy="product-grid"]').should('be.visible');

    // Filter products
    cy.get('[data-cy="category-filter"]').select('Electronics');
    cy.get('[data-cy="product-item"]').should('have.length.greaterThan', 0);

    // Add product to cart
    cy.get('[data-cy="product-item"]').first().click();
    cy.get('[data-cy="product-title"]').should('be.visible');
    cy.get('[data-cy="add-to-cart-button"]').click();

    // Verify cart badge updates
    cy.get('[data-cy="cart-badge"]').should('contain', '1');

    // Add another product
    cy.get('[data-cy="back-to-products"]').click();
    cy.get('[data-cy="product-item"]').eq(1).click();
    cy.get('[data-cy="quantity-input"]').clear().type('2');
    cy.get('[data-cy="add-to-cart-button"]').click();

    // Check cart
    cy.get('[data-cy="cart-badge"]').should('contain', '3');
    cy.get('[data-cy="cart-icon"]').click();

    // Verify cart contents
    cy.get('[data-cy="cart-items"]').should('have.length', 2);
    cy.get('[data-cy="cart-total"]').should('contain', '$');

    // Update quantity in cart
    cy.get('[data-cy="quantity-input"]').first().clear().type('3');
    cy.get('[data-cy="update-quantity"]').first().click();

    // Verify total updated
    cy.get('[data-cy="cart-total"]').should('not.contain', '0');

    // Remove item from cart
    cy.get('[data-cy="remove-item"]').last().click();
    cy.get('[data-cy="cart-items"]').should('have.length', 1);

    // Proceed to checkout
    cy.get('[data-cy="checkout-button"]').click();
    cy.url().should('include', '/checkout');

    // Fill shipping information
    cy.get('[data-cy="shipping-name"]').type('John Doe');
    cy.get('[data-cy="shipping-address"]').type('123 Main St');
    cy.get('[data-cy="shipping-city"]').type('New York');
    cy.get('[data-cy="shipping-zip"]').type('10001');

    // Fill payment information
    cy.get('[data-cy="card-number"]').type('4242424242424242');
    cy.get('[data-cy="card-expiry"]').type('12/25');
    cy.get('[data-cy="card-cvc"]').type('123');
    cy.get('[data-cy="card-name"]').type('John Doe');

    // Place order
    cy.get('[data-cy="place-order-button"]').click();

    // Verify order confirmation
    cy.url().should('include', '/order-confirmation');
    cy.get('[data-cy="order-number"]').should('be.visible');
    cy.get('[data-cy="order-success-message"]').should('contain', 'Order placed successfully');

    // Verify cart is empty
    cy.get('[data-cy="cart-badge"]').should('not.exist');
  });

  it('should handle payment failures gracefully', () => {
    // Add product and go to checkout
    cy.visit('/products');
    cy.get('[data-cy="product-item"]').first().click();
    cy.get('[data-cy="add-to-cart-button"]').click();
    cy.get('[data-cy="cart-icon"]').click();
    cy.get('[data-cy="checkout-button"]').click();

    // Fill required fields
    cy.fillShippingInfo();

    // Use invalid card number
    cy.get('[data-cy="card-number"]').type('4000000000000002'); // Declined card
    cy.get('[data-cy="card-expiry"]').type('12/25');
    cy.get('[data-cy="card-cvc"]').type('123');
    cy.get('[data-cy="card-name"]').type('John Doe');

    cy.get('[data-cy="place-order-button"]').click();

    // Should show payment error
    cy.get('[data-cy="payment-error"]').should('contain', 'Payment failed');
    cy.url().should('include', '/checkout');

    // Cart should still contain items
    cy.get('[data-cy="cart-badge"]').should('exist');
  });
});
```

### Custom Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(email);
    cy.get('[data-cy="password-input"]').type(password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});

Cypress.Commands.add('fillShippingInfo', () => {
  cy.get('[data-cy="shipping-name"]').type('John Doe');
  cy.get('[data-cy="shipping-address"]').type('123 Main St');
  cy.get('[data-cy="shipping-city"]').type('New York');
  cy.get('[data-cy="shipping-zip"]').type('10001');
});

Cypress.Commands.add('addProductToCart', (productIndex = 0, quantity = 1) => {
  cy.visit('/products');
  cy.get('[data-cy="product-item"]').eq(productIndex).click();
  if (quantity > 1) {
    cy.get('[data-cy="quantity-input"]').clear().type(quantity.toString());
  }
  cy.get('[data-cy="add-to-cart-button"]').click();
});

// API testing command
Cypress.Commands.add('apiLogin', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('authToken', response.body.token);
  });
});
```

## Playwright E2E Testing

### Installation and Setup

```bash
# Install Playwright
npm init playwright@latest

# Install browsers
npx playwright install

# Run tests
npx playwright test

# Run tests with UI
npx playwright test --ui
```

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Playwright Test Examples

```javascript
// tests/e2e/user-authentication.spec.js
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Reset database
    await page.request.post('/api/test/reset-database');
    await page.goto('/');
  });

  test('should complete registration and login flow', async ({ page }) => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    // Register user
    await page.click('[data-testid="register-link"]');
    await expect(page).toHaveURL(/register/);

    await page.fill('[data-testid="name-input"]', user.name);
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.fill('[data-testid="confirm-password-input"]', user.password);

    await page.click('[data-testid="register-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText(user.name);

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to home
    await expect(page).toHaveURL('/');

    // Login with registered user
    await page.click('[data-testid="login-link"]');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');

    // Should be logged in
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText(user.name);
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.click('[data-testid="login-link"]');
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    await expect(page).toHaveURL(/login/);
  });
});
```

### Advanced Playwright Features

```javascript
// tests/e2e/advanced-features.spec.js
import { test, expect } from '@playwright/test';

test.describe('Advanced E2E Features', () => {
  test('should handle file uploads', async ({ page }) => {
    await page.goto('/upload');

    // Create a test file
    const fileContent = 'This is a test file';
    const fileName = 'test.txt';

    // Upload file
    await page.setInputFiles('[data-testid="file-input"]', {
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from(fileContent)
    });

    await page.click('[data-testid="upload-button"]');

    // Verify upload success
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-name"]')).toContainText(fileName);
  });

  test('should handle drag and drop', async ({ page }) => {
    await page.goto('/kanban');

    const taskCard = page.locator('[data-testid="task-1"]');
    const targetColumn = page.locator('[data-testid="done-column"]');

    // Drag and drop task
    await taskCard.dragTo(targetColumn);

    // Verify task moved
    await expect(targetColumn.locator('[data-testid="task-1"]')).toBeVisible();
  });

  test('should test responsive design', async ({ page }) => {
    await page.goto('/dashboard');

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeHidden();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="sidebar"]')).toBeHidden();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Test mobile navigation
    await page.click('[data-testid="mobile-menu"]');
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  });

  test('should handle network conditions', async ({ page, context }) => {
    // Simulate slow network
    await context.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
      await route.continue();
    });

    await page.goto('/dashboard');

    // Should show loading states
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Wait for data to load
    await expect(page.locator('[data-testid="dashboard-data"]')).toBeVisible({ timeout: 10000 });
  });

  test('should intercept and mock API calls', async ({ page, context }) => {
    // Mock API response
    await context.route('**/api/users', async (route) => {
      const mockUsers = [
        { id: 1, name: 'Mock User 1', email: 'mock1@example.com' },
        { id: 2, name: 'Mock User 2', email: 'mock2@example.com' }
      ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: mockUsers })
      });
    });

    await page.goto('/users');

    // Verify mock data is displayed
    await expect(page.locator('[data-testid="user-1"]')).toContainText('Mock User 1');
    await expect(page.locator('[data-testid="user-2"]')).toContainText('Mock User 2');
  });
});
```

## Testing Complex User Flows

### Multi-User Scenarios

```javascript
// tests/e2e/multi-user.spec.js
import { test, expect } from '@playwright/test';

test.describe('Multi-User Scenarios', () => {
  test('should handle concurrent users in real-time features', async ({ browser }) => {
    // Create two browser contexts (different users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // User 1 logs in
    await page1.goto('/login');
    await page1.fill('[data-testid="email-input"]', 'user1@example.com');
    await page1.fill('[data-testid="password-input"]', 'password123');
    await page1.click('[data-testid="login-button"]');

    // User 2 logs in
    await page2.goto('/login');
    await page2.fill('[data-testid="email-input"]', 'user2@example.com');
    await page2.fill('[data-testid="password-input"]', 'password123');
    await page2.click('[data-testid="login-button"]');

    // Both users go to chat room
    await page1.goto('/chat/room1');
    await page2.goto('/chat/room1');

    // User 1 sends message
    await page1.fill('[data-testid="message-input"]', 'Hello from User 1');
    await page1.click('[data-testid="send-button"]');

    // User 2 should see the message
    await expect(page2.locator('[data-testid="messages"]')).toContainText('Hello from User 1');

    // User 2 replies
    await page2.fill('[data-testid="message-input"]', 'Hello from User 2');
    await page2.click('[data-testid="send-button"]');

    // User 1 should see the reply
    await expect(page1.locator('[data-testid="messages"]')).toContainText('Hello from User 2');

    await context1.close();
    await context2.close();
  });

  test('should handle collaborative editing', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both users open the same document
    await page1.goto('/documents/123/edit');
    await page2.goto('/documents/123/edit');

    // User 1 starts typing
    await page1.click('[data-testid="editor"]');
    await page1.type('[data-testid="editor"]', 'This is from User 1. ');

    // User 2 should see User 1's changes
    await expect(page2.locator('[data-testid="editor"]')).toContainText('This is from User 1.');

    // User 2 adds content
    await page2.click('[data-testid="editor"]');
    await page2.type('[data-testid="editor"]', 'This is from User 2.');

    // User 1 should see User 2's changes
    await expect(page1.locator('[data-testid="editor"]')).toContainText('This is from User 2.');

    await context1.close();
    await context2.close();
  });
});
```

### Testing with External Services

```javascript
// tests/e2e/external-services.spec.js
import { test, expect } from '@playwright/test';

test.describe('External Services Integration', () => {
  test('should handle payment processing with Stripe', async ({ page }) => {
    // Use Stripe test mode
    await page.goto('/checkout');

    // Fill order information
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="name"]', 'John Doe');

    // Switch to Stripe iframe for card details
    const stripeFrame = page.frameLocator('[title="Secure payment input frame"]');

    // Fill card information (use Stripe test card)
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/25');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    await stripeFrame.locator('[placeholder="ZIP"]').fill('12345');

    // Submit payment
    await page.click('[data-testid="pay-button"]');

    // Wait for payment processing
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({ timeout: 30000 });
  });

  test('should handle Google Maps integration', async ({ page }) => {
    await page.goto('/store-locator');

    // Wait for Google Maps to load
    await expect(page.locator('.gm-style')).toBeVisible({ timeout: 10000 });

    // Search for location
    await page.fill('[data-testid="location-search"]', 'New York, NY');
    await page.click('[data-testid="search-button"]');

    // Wait for markers to appear
    await expect(page.locator('[data-testid="store-marker"]')).toHaveCount({ gte: 1 });

    // Click on a store marker
    await page.locator('[data-testid="store-marker"]').first().click();

    // Verify store info popup
    await expect(page.locator('[data-testid="store-info"]')).toBeVisible();
  });

  test('should handle email service integration', async ({ page, context }) => {
    // Mock email service API
    await context.route('**/api/send-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, messageId: 'test-123' })
      });
    });

    await page.goto('/contact');

    await page.fill('[data-testid="name"]', 'John Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.fill('[data-testid="message"]', 'This is a test message');

    await page.click('[data-testid="send-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toContainText('Message sent successfully');
  });
});
```

## Performance Testing in E2E

```javascript
// tests/e2e/performance.spec.js
import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test('should load pages within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();

    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);

    // Assert load time is under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/users');

    // Load large user list
    await page.selectOption('[data-testid="page-size"]', '1000');

    const startTime = Date.now();
    await expect(page.locator('[data-testid="user-row"]')).toHaveCount(1000);
    const renderTime = Date.now() - startTime;

    console.log(`Large list render time: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(5000);

    // Test scrolling performance
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(100);

    // Should still be responsive after scrolling
    await page.click('[data-testid="search-input"]');
    await page.type('[data-testid="search-input"]', 'test');
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('test');
  });
});
```

## Visual Testing

```javascript
// tests/e2e/visual.spec.js
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  test('should match homepage screenshot', async ({ page }) => {
    await page.goto('/');

    // Wait for images to load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      threshold: 0.5 // 50% threshold for differences
    });
  });

  test('should match component screenshots', async ({ page }) => {
    await page.goto('/components');

    // Test individual components
    const button = page.locator('[data-testid="primary-button"]');
    await expect(button).toHaveScreenshot('primary-button.png');

    const modal = page.locator('[data-testid="modal"]');
    await page.click('[data-testid="open-modal"]');
    await expect(modal).toHaveScreenshot('modal.png');
  });

  test('should test responsive design visually', async ({ page }) => {
    await page.goto('/dashboard');

    // Desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page).toHaveScreenshot('dashboard-desktop.png');

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('dashboard-tablet.png');

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('dashboard-mobile.png');
  });
});
```

## CI/CD Integration

### GitHub Actions for E2E Tests

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  e2e-tests:
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

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps

    - name: Build application
      run: npm run build

    - name: Start application
      run: |
        npm run start &
        npx wait-on http://localhost:3000 --timeout 60000
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db

    - name: Run E2E tests
      run: npx playwright test
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db

    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30

    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: test-results/
        retention-days: 30
```

## Best Practices

### Test Organization

```javascript
// utils/test-helpers.js
export class TestHelpers {
  static async loginUser(page, email, password) {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  }

  static async createTestUser(page, userData) {
    await page.request.post('/api/users', {
      data: userData
    });
  }

  static async cleanupTestData(page) {
    await page.request.post('/api/test/cleanup');
  }

  static generateTestData() {
    return {
      user: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123'
      },
      product: {
        name: 'Test Product',
        price: 99.99,
        stock: 10
      }
    };
  }
}
```

### Page Object Pattern

```javascript
// pages/LoginPage.js
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}

// Using Page Object in tests
import { LoginPage } from '../pages/LoginPage';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');

  await expect(page).toHaveURL('/dashboard');
});
```

## Conclusion

End-to-End testing provides confidence that your entire application works correctly from the user's perspective. Key takeaways:

1. **Test critical user journeys** that represent real usage
2. **Use proper test data management** and cleanup
3. **Implement visual testing** for UI consistency
4. **Test across different browsers and devices**
5. **Integrate E2E tests** into your CI/CD pipeline
6. **Balance thoroughness with execution time**

E2E tests are your final safety net before deployment, ensuring that users will have a smooth experience with your application.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).