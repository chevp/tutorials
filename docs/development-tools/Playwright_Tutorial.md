# Playwright Tutorial

Playwright is a modern end-to-end testing framework developed by Microsoft that enables reliable testing across Chromium, Firefox, and WebKit browsers. It provides powerful automation capabilities for web applications with built-in support for modern web features like auto-waiting, network interception, and mobile emulation.

---

## Prerequisites

1. **Node.js**: Ensure Node.js (version 16 or higher) is installed:
   ```bash
   node -v
   npm -v
   ```

2. **Basic knowledge of JavaScript/TypeScript**: Understanding of modern JavaScript syntax and concepts.

3. **Web development basics**: Familiarity with HTML, CSS, and web application concepts.

---

## 1. Installation and Setup

### Installing Playwright

Create a new project and install Playwright:

```bash
npm init playwright@latest
```

This command will:
- Create a new Playwright project
- Install Playwright and browsers
- Create example tests and configuration files

### Manual Installation

For existing projects, install Playwright manually:

```bash
npm install -D @playwright/test
npx playwright install
```

### Project Structure

After installation, your project will have:
```
tests/
├── example.spec.ts          # Example test file
playwright.config.ts         # Configuration file
package.json
```

---

## 2. Basic Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
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
  ],
});
```

---

## 3. Writing Your First Test

### Basic Test Structure

Create a test file `tests/my-first-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects the URL to contain intro
  await expect(page).toHaveURL(/.*intro/);
});
```

### Key Concepts

- **`test()`**: Defines a test case
- **`page`**: Browser page object for interactions
- **`expect()`**: Assertion library for validations
- **Auto-waiting**: Playwright automatically waits for elements to be ready

---

## 4. Locating Elements

### Locator Strategies

```typescript
// By role (recommended)
await page.getByRole('button', { name: 'Submit' });
await page.getByRole('textbox', { name: 'Username' });

// By text content
await page.getByText('Welcome');
await page.getByText(/Sign in/i);

// By label (for form inputs)
await page.getByLabel('Email');

// By placeholder
await page.getByPlaceholder('Enter your email');

// By test ID
await page.getByTestId('submit-button');

// CSS selectors
await page.locator('#username');
await page.locator('.submit-btn');

// XPath
await page.locator('xpath=//button[contains(text(), "Submit")]');
```

---

## 5. Common Actions and Assertions

### User Interactions

```typescript
test('user interactions', async ({ page }) => {
  await page.goto('https://example.com/form');

  // Fill input fields
  await page.getByLabel('Name').fill('John Doe');

  // Click buttons
  await page.getByRole('button', { name: 'Submit' }).click();

  // Select dropdown options
  await page.getByLabel('Country').selectOption('US');

  // Check/uncheck checkboxes
  await page.getByLabel('Subscribe').check();
  await page.getByLabel('Terms').uncheck();

  // Upload files
  await page.getByLabel('Upload').setInputFiles('path/to/file.pdf');

  // Hover over elements
  await page.getByRole('link', { name: 'Menu' }).hover();
});
```

### Assertions

```typescript
test('assertions', async ({ page }) => {
  await page.goto('https://example.com');

  // Page assertions
  await expect(page).toHaveTitle('Expected Title');
  await expect(page).toHaveURL('https://example.com');

  // Element assertions
  const button = page.getByRole('button', { name: 'Submit' });
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  await expect(button).toHaveText('Submit');
  await expect(button).toHaveAttribute('type', 'submit');

  // Text content assertions
  await expect(page.getByText('Welcome')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Hello');

  // Count assertions
  await expect(page.getByRole('listitem')).toHaveCount(5);
});
```

---

## 6. Advanced Features

### Page Object Model

Create reusable page objects for better test organization:

```typescript
// pages/login-page.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async getErrorMessage() {
    return await this.page.getByTestId('error-message').textContent();
  }
}

// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

test('login test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');

  await expect(page).toHaveURL('/dashboard');
});
```

### Network Interception

```typescript
test('mock API responses', async ({ page }) => {
  // Mock API response
  await page.route('**/api/users', async route => {
    const json = [{ id: 1, name: 'John Doe' }];
    await route.fulfill({ json });
  });

  await page.goto('/users');
  await expect(page.getByText('John Doe')).toBeVisible();
});
```

### Mobile Testing

```typescript
import { test, expect, devices } from '@playwright/test';

test('mobile test', async ({ browser }) => {
  const context = await browser.newContext({
    ...devices['iPhone 13'],
  });

  const page = await context.newPage();
  await page.goto('https://example.com');

  // Test mobile-specific functionality
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
});
```

---

## 7. Running Tests

### Command Line Options

```bash
# Run all tests
npx playwright test

# Run tests in specific file
npx playwright test tests/login.spec.ts

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with debugging
npx playwright test --debug

# Generate test report
npx playwright show-report
```

### Debugging Tests

```typescript
test('debug test', async ({ page }) => {
  await page.goto('https://example.com');

  // Pause execution for debugging
  await page.pause();

  // Take screenshot for debugging
  await page.screenshot({ path: 'debug-screenshot.png' });
});
```

---

## 8. Best Practices

### Test Organization

1. **Use descriptive test names**
2. **Group related tests** using `test.describe()`
3. **Use Page Object Model** for complex applications
4. **Keep tests independent** and isolated

### Performance Tips

```typescript
// Use beforeAll for expensive setup
test.beforeAll(async ({ browser }) => {
  // Setup that runs once per test file
});

// Use fixtures for common test data
test('test with fixture', async ({ page }) => {
  // Test implementation
});

// Parallel execution
test.describe.configure({ mode: 'parallel' });
```

### Reliable Testing

```typescript
// Wait for network requests to complete
await page.waitForLoadState('networkidle');

// Wait for specific elements
await page.waitForSelector('[data-testid="content"]');

// Use soft assertions for non-critical checks
await expect.soft(page.getByText('Optional content')).toBeVisible();
```

---

## 9. Continuous Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

---

## Summary

This tutorial covered the essential aspects of Playwright:

1. **Installation and setup** with automatic browser management
2. **Basic test writing** with modern locators and auto-waiting
3. **Element interaction** and assertion patterns
4. **Advanced features** like Page Object Model and network mocking
5. **Testing strategies** for mobile and cross-browser compatibility
6. **Best practices** for maintainable and reliable tests

Playwright provides a comprehensive solution for modern web testing with excellent developer experience and powerful automation capabilities.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).