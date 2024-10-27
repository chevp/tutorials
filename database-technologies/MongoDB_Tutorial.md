
# MongoDB Tutorial

MongoDB is a NoSQL document-oriented database that stores data in a flexible, JSON-like format. It is known for scalability, high performance, and the ability to handle unstructured data. MongoDB is commonly used in modern applications for its flexibility and ease of integration.

---

## 1. Installing MongoDB

### Option 1: Download and Install MongoDB

1. Go to the [MongoDB website](https://www.mongodb.com/try/download/community) and download the latest MongoDB Community Server.
2. Follow the installation instructions based on your operating system.

### Option 2: Using Docker

If you have Docker installed, you can run MongoDB in a container:

```bash
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=secret mongo
```

This starts MongoDB on `localhost:27017` with username `mongoadmin` and password `secret`.

---

## 2. Basic MongoDB Commands

To connect to the MongoDB shell, run:

```bash
mongosh
```

Once connected, you can interact with the database.

### Show All Databases

```javascript
show dbs
```

### Select or Create a Database

```javascript
use myDatabase
```

---

## 3. MongoDB Collections and Documents

- **Collection**: A group of MongoDB documents, similar to a table in a relational database.
- **Document**: A single record in a MongoDB collection, stored in BSON (Binary JSON) format.

### Example: Creating a Collection

```javascript
db.createCollection("users")
```

### Example: Inserting a Document

```javascript
db.users.insertOne({ name: "Alice", age: 30, email: "alice@example.com" })
```

---

## 4. Querying Documents

Retrieve data from a collection using `find`.

### Example: Find All Documents

```javascript
db.users.find()
```

### Example: Find Documents with a Condition

```javascript
db.users.find({ age: { $gt: 25 } })
```

This retrieves all users older than 25.

### Projection

Specify fields to include or exclude in the output.

```javascript
db.users.find({}, { name: 1, _id: 0 })
```

---

## 5. Updating Documents

Update existing documents using `updateOne` or `updateMany`.

### Example: Update a Single Document

```javascript
db.users.updateOne({ name: "Alice" }, { $set: { age: 31 } })
```

### Example: Update Multiple Documents

```javascript
db.users.updateMany({}, { $set: { active: true } })
```

---

## 6. Deleting Documents

Remove documents using `deleteOne` or `deleteMany`.

### Example: Delete a Single Document

```javascript
db.users.deleteOne({ name: "Alice" })
```

### Example: Delete Multiple Documents

```javascript
db.users.deleteMany({ age: { $lt: 25 } })
```

---

## 7. Indexes in MongoDB

Indexes improve query performance by allowing MongoDB to quickly locate data.

### Creating an Index

```javascript
db.users.createIndex({ name: 1 })
```

### Viewing Indexes

```javascript
db.users.getIndexes()
```

---

## 8. Using MongoDB with Node.js

You can connect to MongoDB from a Node.js application using the MongoDB Node.js driver.

### Step 1: Install MongoDB Driver

```bash
npm install mongodb
```

### Step 2: Connect to MongoDB

```javascript
const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db("myDatabase");
        const users = database.collection("users");

        // Insert a document
        const result = await users.insertOne({ name: "Bob", age: 25 });
        console.log(`New user created with id: ${result.insertedId}`);
    } finally {
        await client.close();
    }
}

run().catch(console.error);
```

---

## 9. Aggregation

MongoDB’s aggregation framework allows complex data processing and transformations.

### Example: Aggregation Pipeline

```javascript
db.users.aggregate([
    { $match: { age: { $gte: 25 } } },
    { $group: { _id: "$age", count: { $sum: 1 } } }
])
```

This groups users by age and counts how many users fall into each age category.

---

## 10. Exporting and Importing Data

### Exporting Data

To export a MongoDB collection to JSON or CSV:

```bash
mongoexport --db=myDatabase --collection=users --out=users.json
```

### Importing Data

To import data from a JSON file:

```bash
mongoimport --db=myDatabase --collection=users --file=users.json
```

---

## Summary

This tutorial covered MongoDB basics:

1. **Installing MongoDB** and setting up a database.
2. **Creating collections and documents**.
3. **Querying, updating, and deleting documents**.
4. **Using MongoDB with Node.js** for data operations.
5. **Using the aggregation framework** for data analysis.

MongoDB is an excellent choice for applications that require flexible, scalable, and schema-less data storage.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
