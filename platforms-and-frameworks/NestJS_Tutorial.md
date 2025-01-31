
# NestJS Tutorial

## Introduction
NestJS is a powerful and scalable framework for building backend applications. It's built with TypeScript and is heavily inspired by Angular, making it a great choice for TypeScript developers.

## Prerequisites
Before we start, make sure you have the following installed:
- Node.js (>= 14.0.0)
- npm (>= 6.0.0) or Yarn (>= 1.22.0)
- TypeScript (>= 4.0.0) – if not installed globally, it will be managed by NestJS CLI.

## Installation

### Step 1: Install NestJS CLI
First, install the NestJS CLI globally.
```bash
npm i -g @nestjs/cli
```

### Step 2: Create a New Project
You can create a new NestJS project with the following command:
```bash
nest new my-nest-app
```
This will generate a new NestJS project with a set of default files and folders.

### Step 3: Install Dependencies
Navigate to the project directory and install the required dependencies.
```bash
cd my-nest-app
npm install
```

## Project Structure
NestJS follows a modular architecture. The main elements in the project structure are:
- **src/**: Contains all the source code for your application.
  - **app.controller.ts**: Basic controller for handling HTTP requests.
  - **app.module.ts**: The root module that ties everything together.
  - **app.service.ts**: Basic service for business logic.
  
## Creating a Basic Controller

1. **Generate a Controller**
To create a controller, use the NestJS CLI.
```bash
nest generate controller hello
```
This creates a `hello.controller.ts` file inside the `src` directory.

2. **Controller Code**
Inside `hello.controller.ts`, define a simple GET route.
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('hello')
export class HelloController {
  @Get()
  getHello(): string {
    return 'Hello, NestJS!';
  }
}
```

### Step 4: Running the Application
To run the NestJS app, use the following command:
```bash
npm run start
```

Visit `http://localhost:3000/hello` in your browser, and you should see the message `Hello, NestJS!`.

## Creating a Service

1. **Generate a Service**
To generate a service, use the CLI:
```bash
nest generate service hello
```

2. **Service Code**
In `hello.service.ts`, add the logic:
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  getHello(): string {
    return 'Hello from the service!';
  }
}
```

3. **Injecting the Service into the Controller**
Update `hello.controller.ts` to use the `HelloService`:
```typescript
import { Controller, Get } from '@nestjs/common';
import { HelloService } from './hello.service';

@Controller('hello')
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get()
  getHello(): string {
    return this.helloService.getHello();
  }
}
```

### Step 5: Running the Application Again
Run the app again using:
```bash
npm run start
```
Now, when you visit `http://localhost:3000/hello`, you'll see the message `Hello from the service!`.

## Conclusion
You have successfully set up a basic NestJS application with a controller and service. NestJS offers powerful tools to build scalable and maintainable backend applications, with support for REST APIs, GraphQL, microservices, and more.

## Further Learning
- [NestJS Documentation](https://nestjs.com/)
- [NestJS GitHub Repository](https://github.com/nestjs/nest)

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
