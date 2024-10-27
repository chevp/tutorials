
# Neo4j Tutorial

Neo4j is a graph database management system, which is designed for efficiently managing data with complex relationships. Neo4j stores data as nodes, relationships, and properties, making it an ideal choice for applications requiring highly connected data.

---

## 1. Installing Neo4j

### Option 1: Using Neo4j Desktop

1. Download and install Neo4j Desktop from the [Neo4j website](https://neo4j.com/download/).
2. Open Neo4j Desktop and create a new project.
3. Start a database by clicking **New Database** and providing a password.

### Option 2: Using Docker

Alternatively, if you have Docker, you can run Neo4j in a container:

```bash
docker run -d --name neo4j -p7474:7474 -p7687:7687 -e NEO4J_AUTH=neo4j/test neo4j
```

This command starts Neo4j on `http://localhost:7474` with the username `neo4j` and password `test`.

---

## 2. Understanding Neo4j Basics

### Key Components

- **Nodes**: Represent entities (e.g., Person, Product) in the graph.
- **Relationships**: Connect nodes to show how they relate to each other (e.g., FRIEND_OF, PURCHASED).
- **Properties**: Key-value pairs that store information about nodes or relationships.

### Cypher Query Language

Neo4j uses Cypher, a declarative language for querying the database.

---

## 3. Basic Cypher Queries

### Creating Nodes

To create a node, use the `CREATE` statement:

```cypher
CREATE (p:Person {name: "Alice", age: 30})
```

Here, `p` is a variable for the node, `Person` is a label, and `{name: "Alice", age: 30}` are properties.

### Creating Relationships

Create a relationship between two nodes:

```cypher
MATCH (a:Person {name: "Alice"}), (b:Person {name: "Bob"})
CREATE (a)-[:FRIEND_OF]->(b)
```

This creates a `FRIEND_OF` relationship from Alice to Bob.

### Retrieving Data

Retrieve all nodes labeled `Person`:

```cypher
MATCH (p:Person)
RETURN p
```

Retrieve specific properties:

```cypher
MATCH (p:Person)
RETURN p.name, p.age
```

---

## 4. Filtering Data

Use the `WHERE` clause to filter results.

```cypher
MATCH (p:Person)
WHERE p.age > 25
RETURN p.name, p.age
```

Use multiple conditions:

```cypher
MATCH (p:Person)
WHERE p.age > 25 AND p.name = "Alice"
RETURN p
```

---

## 5. Updating Data

Update properties on a node:

```cypher
MATCH (p:Person {name: "Alice"})
SET p.age = 31
```

Add a new property:

```cypher
MATCH (p:Person {name: "Alice"})
SET p.city = "London"
```

---

## 6. Deleting Data

Delete relationships and nodes.

### Delete a Relationship

```cypher
MATCH (a:Person {name: "Alice"})-[r:FRIEND_OF]->(b:Person {name: "Bob"})
DELETE r
```

### Delete a Node

To delete a node, first remove its relationships:

```cypher
MATCH (p:Person {name: "Alice"})
DETACH DELETE p
```

---

## 7. Using Neo4j with JavaScript

You can connect to Neo4j using the Neo4j JavaScript Driver.

1. **Install the Neo4j Driver**:

    ```bash
    npm install neo4j-driver
    ```

2. **Create a Connection**:

    ```javascript
    const neo4j = require('neo4j-driver');
    const driver = neo4j.driver('neo4j://localhost', neo4j.auth.basic('neo4j', 'password'));
    const session = driver.session();
    ```

3. **Run a Query**:

    ```javascript
    async function fetchPeople() {
        const result = await session.run('MATCH (p:Person) RETURN p.name AS name, p.age AS age');
        result.records.forEach(record => {
            console.log(`Name: ${record.get('name')}, Age: ${record.get('age')}`);
        });
    }
    fetchPeople();
    ```

4. **Close the Connection**:

    ```javascript
    session.close();
    driver.close();
    ```

---

## 8. Indexes and Constraints

Indexes and constraints help speed up queries and maintain data integrity.

### Creating an Index

```cypher
CREATE INDEX FOR (p:Person) ON (p.name)
```

### Creating a Unique Constraint

```cypher
CREATE CONSTRAINT FOR (p:Person) REQUIRE p.email IS UNIQUE
```

---

## Summary

This tutorial covered Neo4j basics:

1. Setting up Neo4j and understanding nodes, relationships, and properties.
2. Using Cypher for CRUD operations.
3. Querying, filtering, and updating data.
4. Connecting to Neo4j with JavaScript.

Neo4j is a powerful choice for applications that require efficient handling of highly connected data.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
