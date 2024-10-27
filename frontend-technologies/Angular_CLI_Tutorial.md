
# Angular CLI Commands Tutorial

The Angular CLI (Command Line Interface) is a powerful tool for developing Angular applications. It helps with creating, building, testing, and deploying Angular projects. This tutorial covers essential Angular CLI commands with explanations and examples.

---

## Prerequisites

1. **Node.js and npm**: Ensure that Node.js and npm are installed on your system. Verify by running:
    ```bash
    node -v
    npm -v
    ```

2. **Installing Angular CLI**: Install the Angular CLI globally using npm:
    ```bash
    npm install -g @angular/cli
    ```

3. **Verify Installation**: Check if Angular CLI is installed successfully by running:
    ```bash
    ng version
    ```

---

## 1. Creating a New Angular Project

To start a new Angular project, use:
```bash
ng new <project-name>
```

**Example**:
```bash
ng new my-angular-app
```

### Options
- `--routing`: Adds a routing module to your application.
- `--style=[css|scss|sass|less]`: Specifies the stylesheet format.

---

## 2. Serving the Application

To run the application locally, navigate to the project folder and use:
```bash
ng serve
```

By default, it runs on `http://localhost:4200/`.

### Options
- `--open` or `-o`: Opens the app in the default browser.
- `--port [port-number]`: Specifies a different port.
- `--proxy-config`: Uses a proxy configuration file.

**Example**:
```bash
ng serve --open --port 4500
```

---

## 3. Generating Components, Services, Modules, and More

Use the `ng generate` (or `ng g`) command to create various Angular building blocks. 

- **Component**:
  ```bash
  ng generate component <component-name>
  ```
  **Example**:
  ```bash
  ng generate component home
  ```

- **Service**:
  ```bash
  ng generate service <service-name>
  ```
  **Example**:
  ```bash
  ng generate service data
  ```

- **Module**:
  ```bash
  ng generate module <module-name>
  ```
  **Example**:
  ```bash
  ng generate module user --routing
  ```

---

## 4. Building the Application

To build the application for deployment:
```bash
ng build
```

The default build output will be in the `dist/` folder.

### Options
- `--prod`: Builds the app in production mode, optimizing for performance.
- `--output-path`: Specifies a different output directory.

**Example**:
```bash
ng build --prod --output-path=build
```

---

## 5. Running Unit Tests

Angular CLI uses Karma as the test runner and Jasmine for test syntax.

To run unit tests:
```bash
ng test
```

### Options
- `--watch=false`: Runs tests once without watching for changes.

---

## 6. Running End-to-End Tests

Angular CLI provides end-to-end testing with Protractor by default.

To run e2e tests:
```bash
ng e2e
```

### Options
- `--prod`: Runs e2e tests in production mode.

---

## 7. Linting the Code

To check your code for linting errors:
```bash
ng lint
```

### Options
- `--fix`: Automatically fixes linting errors where possible.

---

## 8. Updating Angular CLI and Dependencies

To update Angular CLI and project dependencies:
```bash
ng update
```

**Example**: To update Angular core and CLI to the latest version:
```bash
ng update @angular/core @angular/cli
```

---

## 9. Analyzing Build Statistics

You can use the `--stats-json` option with `ng build` to get detailed information about the build process:
```bash
ng build --prod --stats-json
```

---

## 10. Customizing Angular Configuration

Angular CLI provides configuration options that can be modified in `angular.json`. Here, you can change settings such as:
- Default build configurations (e.g., production vs. development).
- Output paths, file replacements, and assets configurations.

---

## Summary of Angular CLI Commands

| Command                   | Description                                      |
|---------------------------|--------------------------------------------------|
| `ng new <project-name>`   | Creates a new Angular project                    |
| `ng serve`                | Runs the app on a local server                   |
| `ng generate <type>`      | Generates Angular building blocks                |
| `ng build`                | Compiles the app into an output directory        |
| `ng test`                 | Runs unit tests                                  |
| `ng e2e`                  | Runs end-to-end tests                            |
| `ng lint`                 | Lints code for issues                            |
| `ng update`               | Updates Angular CLI and dependencies             |
| `ng config <key> <value>` | Configures Angular settings                      |

---

By using these commands with appropriate options, you can enhance productivity and optimize your Angular development experience.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
