
# Node.js Tutorial

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine, allowing JavaScript to run on the server side. It's widely used for building web servers, APIs, and real-time applications.

---

## 1. Installing Node.js

1. **Download Node.js** from the [Node.js website](https://nodejs.org).
2. Run the installer and follow the instructions.

### Verifying Installation

Check if Node.js and npm (Node Package Manager) are installed:

```bash
node -v
npm -v
```

---

## 2. Creating Your First Node.js Application

1. **Create a new directory** for your project:

    ```bash
    mkdir my-node-app
    cd my-node-app
    ```

2. **Initialize a new Node.js project**:

    ```bash
    npm init -y
    ```

   This will create a `package.json` file to manage your project’s dependencies.

3. **Create an `index.js` file** with the following code:

    ```javascript
    console.log("Hello, Node.js!");
    ```

4. Run the application:

    ```bash
    node index.js
    ```

---

## 3. Using Modules in Node.js

Node.js has a modular structure, where different functionalities are separated into modules.

### Importing Built-in Modules

Example with the `fs` (File System) module:

```javascript
const fs = require('fs');

fs.writeFile('hello.txt', 'Hello, Node.js!', (err) => {
    if (err) throw err;
    console.log('File created!');
});
```

### Creating Your Own Modules

Create `math.js`:

```javascript
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
```

In `index.js`, import and use the module:

```javascript
const math = require('./math');

console.log(math.add(5, 3)); // 8
```

---

## 4. Installing and Using Packages with npm

Use npm to install third-party packages from the npm registry.

### Example: Installing `express`

1. Install the **express** package:

    ```bash
    npm install express
    ```

2. Create a basic Express server in `index.js`:

    ```javascript
    const express = require('express');
    const app = express();

    app.get('/', (req, res) => {
        res.send('Hello from Express!');
    });

    app.listen(3000, () => {
        console.log('Server running on http://localhost:3000');
    });
    ```

3. Run the server:

    ```bash
    node index.js
    ```

Open `http://localhost:3000` in your browser.

---

## 5. Working with Async Code in Node.js

Node.js is asynchronous and uses callbacks, promises, and async/await.

### Example: Promises

```javascript
const fs = require('fs').promises;

fs.writeFile('example.txt', 'Hello, World!')
    .then(() => console.log('File written'))
    .catch((err) => console.error(err));
```

### Example: Async/Await

```javascript
async function writeFile() {
    try {
        await fs.writeFile('example.txt', 'Hello, Async/Await!');
        console.log('File written');
    } catch (err) {
        console.error(err);
    }
}

writeFile();
```

---

## 6. Building a Simple REST API with Express

1. **Define a REST API endpoint** in `index.js`:

    ```javascript
    const express = require('express');
    const app = express();

    app.use(express.json());

    let items = [{ id: 1, name: 'Item 1' }];

    app.get('/items', (req, res) => {
        res.json(items);
    });

    app.post('/items', (req, res) => {
        const item = { id: items.length + 1, name: req.body.name };
        items.push(item);
        res.status(201).json(item);
    });

    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
    ```

2. **Test the API** with a tool like **Postman** or **curl**:

    ```bash
    curl -X GET http://localhost:3000/items
    ```

---

## 7. Debugging in Node.js

Use the Node.js debugger to debug applications.

### Starting the Debugger

Run Node.js with the `inspect` flag:

```bash
node inspect index.js
```

Set breakpoints and step through code using `c` (continue) and `n` (next).

### Using `console.log` for Debugging

Add `console.log` statements to inspect variables and function outputs.

---

## 8. Deploying Node.js Applications

### Deploying with Heroku

1. **Install the Heroku CLI** and login.

2. **Initialize a Git repository** (if not already):

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

3. **Create a Heroku app** and deploy:

    ```bash
    heroku create
    git push heroku master
    ```

---

## Summary

This tutorial covered the basics of Node.js:

1. **Setting up Node.js** and creating a project.
2. **Working with modules** and npm packages.
3. **Building a REST API** with Express.
4. **Understanding async programming** with Promises and async/await.

Node.js provides a powerful and scalable solution for building server-side applications using JavaScript.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
