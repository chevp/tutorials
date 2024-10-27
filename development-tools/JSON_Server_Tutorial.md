
# JSON Server Tutorial

JSON Server is a simple tool for setting up a REST API using a JSON file as a data source. It is great for prototyping, testing, and simulating a backend for frontend applications.

---

## 1. Prerequisites

Before getting started with JSON Server, make sure you have the following installed:

- **Node.js**: You can download it from [Node.js Official Website](https://nodejs.org/). This will also install `npm` (Node Package Manager).

### Verify Installation

To check if Node.js and npm are installed, run the following commands:

```bash
node -v
npm -v
```

---

## 2. Installing JSON Server

You can install JSON Server globally on your system using npm:

```bash
npm install -g json-server
```

Alternatively, you can install it as a dev dependency in your project:

```bash
npm install --save-dev json-server
```

---

## 3. Creating a JSON File

Create a JSON file that will serve as the database. For example, create a file named `db.json`:

```json
{
  "posts": [
    { "id": 1, "title": "Hello World", "author": "John Doe" },
    { "id": 2, "title": "JSON Server is Great", "author": "Jane Doe" }
  ],
  "comments": [
    { "id": 1, "body": "Nice post!", "postId": 1 },
    { "id": 2, "body": "Thanks for sharing!", "postId": 2 }
  ]
}
```

---

## 4. Running JSON Server

To run JSON Server and serve the `db.json` file, use the following command in your terminal:

```bash
json-server --watch db.json
```

By default, JSON Server runs on `http://localhost:3000`. You can specify a different port using the `--port` option:

```bash
json-server --watch db.json --port 4000
```

### Accessing the API

Once the server is running, you can access the resources defined in your JSON file. For example:

- **Get all posts**: `GET http://localhost:3000/posts`
- **Get a single post**: `GET http://localhost:3000/posts/1`
- **Get all comments**: `GET http://localhost:3000/comments`
- **Get comments for a specific post**: `GET http://localhost:3000/comments?postId=1`

---

## 5. Creating Resources

You can create new resources using HTTP POST requests. For example, to add a new post, you can use `curl`:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"title": "New Post", "author": "John Smith"}' http://localhost:3000/posts
```

Alternatively, you can use a tool like Postman or Insomnia to make the request.

---

## 6. Updating Resources

To update an existing resource, use the HTTP PUT or PATCH method. Here’s an example using `curl` to update a post:

```bash
curl -X PUT -H "Content-Type: application/json" -d '{"title": "Updated Post", "author": "John Smith"}' http://localhost:3000/posts/1
```

---

## 7. Deleting Resources

To delete a resource, use the HTTP DELETE method. Here’s how to delete a post:

```bash
curl -X DELETE http://localhost:3000/posts/1
```

---

## 8. Custom Routes

You can create custom routes in JSON Server by using the `--routes` option with a `routes.json` file. Here’s an example `routes.json` file:

```json
{
  "/api/posts": "/posts",
  "/api/comments": "/comments"
}
```

Run JSON Server with custom routes:

```bash
json-server --watch db.json --routes routes.json
```

### Accessing Custom Routes

With the above routes, you can now access your posts at `http://localhost:3000/api/posts`.

---

## 9. Conclusion

JSON Server is a powerful tool for quickly setting up a mock REST API. This tutorial covered the basics of installation, running the server, and performing CRUD operations. It’s a great way to simulate a backend for your frontend applications.

### Further Reading

- [JSON Server Documentation](https://github.com/typicode/json-server)
- [Learn More About REST APIs](https://restfulapi.net/)
