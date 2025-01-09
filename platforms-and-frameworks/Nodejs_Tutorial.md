# Node.js Tutorial

Node.js is an open-source, cross-platform runtime environment that allows you to run JavaScript code on the server-side. It is built on Chrome's V8 JavaScript engine and is widely used for building scalable network applications.

---

## 1. Getting Started

### Installation
1. Download and install Node.js from [nodejs.org](https://nodejs.org/).
2. Verify installation:
   ```bash
   node -v   # Check Node.js version
   npm -v    # Check npm version
   ```

### Running Your First Script
Create a file named `app.js`:
```javascript
console.log("Hello, Node.js!");
```
Run the file using:
```bash
node app.js
```

---

## 2. Core Concepts

### Global Objects
Node.js provides several global objects like `__dirname`, `__filename`, and `process`.

```javascript
console.log(__dirname);  // Directory of the current module
console.log(__filename); // Filename of the current module
```

### REPL (Read-Eval-Print Loop)
Start the Node.js REPL by typing `node` in the terminal.
```bash
node
```
You can run JavaScript expressions directly:
```javascript
> 2 + 3
5
```

---

## 3. Modules

### Built-in Modules
Node.js comes with built-in modules like `fs`, `http`, `path`, and more.

#### Example: Using the `os` module
```javascript
const os = require("os");
console.log(os.platform());
console.log(os.freemem());
```

### Custom Modules
Create a module:
```javascript
// math.js
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
```
Use the module in another file:
```javascript
const math = require("./math");
console.log(math.add(5, 3));
```

---

## 4. File System Operations

### Reading and Writing Files
Use the `fs` module for file operations.

#### Reading a File
```javascript
const fs = require("fs");
fs.readFile("example.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

#### Writing to a File
```javascript
fs.writeFile("example.txt", "Hello, Node.js!", (err) => {
  if (err) throw err;
  console.log("File written successfully!");
});
```

---

## 5. HTTP Server

### Creating a Simple Server
```javascript
const http = require("http");

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello, World!\n");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
```

---

## 6. Event Loop and Events

### Using Event Emitters
```javascript
const EventEmitter = require("events");
const emitter = new EventEmitter();

emitter.on("greet", () => {
  console.log("Hello, Event!");
});

emitter.emit("greet");
```

---

## 7. npm and Package Management

### Installing Packages
Search for a package on [npmjs.com](https://www.npmjs.com/).

Install a package:
```bash
npm install lodash
```

Use it in your project:
```javascript
const _ = require("lodash");
console.log(_.capitalize("hello world"));
```

### Managing Dependencies
- **Install all dependencies** from `package.json`:
  ```bash
  npm install
  ```
- **Uninstall a package**:
  ```bash
  npm uninstall lodash
  ```

---

## 8. Express Framework

### Setting Up Express
Install Express:
```bash
npm install express
```

Create a simple Express server:
```javascript
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
```

---

## 9. Asynchronous Programming

### Callbacks
```javascript
fs.readFile("example.txt", (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
```

### Promises
```javascript
const readFile = require("fs").promises.readFile;
readFile("example.txt", "utf8")
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Async/Await
```javascript
async function readFileAsync() {
  try {
    const data = await fs.promises.readFile("example.txt", "utf8");
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
readFileAsync();
```

---

## 10. Connecting to Databases

### Using MongoDB with Mongoose

Install Mongoose:
```bash
npm install mongoose
```

Connect to MongoDB:
```javascript
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});
```

Define a Schema and Model:
```javascript
const schema = new mongoose.Schema({ name: String });
const Model = mongoose.model("Model", schema);

const doc = new Model({ name: "Node.js" });
doc.save().then(() => console.log("Document saved"));
```

---

## Conclusion

This tutorial covers the basics and core features of Node.js. Explore further by building projects and learning advanced topics like streams, clustering, and WebSockets.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
