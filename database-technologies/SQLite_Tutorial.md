
# SQLite Tutorial

SQLite is a lightweight, serverless, and self-contained SQL database engine. It is commonly used in mobile apps, web applications, and embedded systems where a full database server is unnecessary.

---

## 1. Installing SQLite

### Option 1: Download SQLite Command-Line Tool

1. Go to the [SQLite website](https://sqlite.org/download.html) and download the command-line tool for your operating system.
2. Extract the downloaded file and add it to your system's PATH.

### Option 2: Using SQLite in Python

If you are using Python, you can directly access SQLite without additional installation, as Python comes with SQLite support through the `sqlite3` module.

---

## 2. Basic SQLite Commands

### Starting SQLite

Open a terminal and enter:

```bash
sqlite3 my_database.db
```

This will create a new SQLite database file `my_database.db` if it doesn't already exist.

### Exiting SQLite

To exit the SQLite prompt, type:

```sql
.exit
```

---

## 3. Creating Tables

To create a table, use the `CREATE TABLE` statement.

### Example

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    email TEXT UNIQUE
);
```

This creates a table `users` with columns for `id`, `name`, `age`, and `email`.

---

## 4. Inserting Data

Use the `INSERT INTO` statement to add data to a table.

### Example

```sql
INSERT INTO users (name, age, email) VALUES ('Alice', 30, 'alice@example.com');
```

You can insert multiple records by executing additional `INSERT INTO` statements.

---

## 5. Querying Data

Retrieve data using the `SELECT` statement.

### Example

```sql
SELECT * FROM users;
```

Retrieve specific columns:

```sql
SELECT name, age FROM users;
```

Apply filters with `WHERE`:

```sql
SELECT * FROM users WHERE age > 25;
```

---

## 6. Updating Data

Use the `UPDATE` statement to modify existing records.

### Example

```sql
UPDATE users SET age = 31 WHERE name = 'Alice';
```

---

## 7. Deleting Data

Use the `DELETE FROM` statement to remove records.

### Example

```sql
DELETE FROM users WHERE name = 'Alice';
```

---

## 8. Constraints and Indexes

SQLite supports constraints and indexes to enforce data integrity and improve query performance.

### Adding Constraints

Define constraints (e.g., `UNIQUE`, `NOT NULL`) when creating a table.

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price REAL CHECK(price > 0)
);
```

### Creating Indexes

Use the `CREATE INDEX` statement to create an index:

```sql
CREATE INDEX idx_user_name ON users(name);
```

---

## 9. Using SQLite with Python

Python has built-in support for SQLite via the `sqlite3` module.

### Example

```python
import sqlite3

# Connect to SQLite database
conn = sqlite3.connect('my_database.db')
cursor = conn.cursor()

# Create a table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER
)
''')

# Insert data
cursor.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("Alice", 30))

# Query data
cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()
for row in rows:
    print(row)

# Close the connection
conn.commit()
conn.close()
```

---

## 10. Exporting and Importing Data

### Exporting Data

To export data to a CSV file:

```sql
.mode csv
.output users.csv
SELECT * FROM users;
```

### Importing Data

To import data from a CSV file:

```sql
.mode csv
.import users.csv users
```

---

## Summary

This tutorial covered SQLite basics:

1. **Installing SQLite** and setting up a database.
2. **Creating tables** and working with data (inserting, querying, updating, and deleting).
3. **Adding constraints and indexes** to improve data integrity and performance.
4. **Using SQLite with Python** for data management.

SQLite is a versatile, lightweight choice for applications that require a simple database solution.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
