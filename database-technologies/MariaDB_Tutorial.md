
# MariaDB Tutorial

MariaDB is an open-source relational database management system (RDBMS) that is a popular alternative to MySQL. It is fast, scalable, and suitable for various types of applications, from small websites to large data warehouses.

---

## Prerequisites

1. **MariaDB Installation**: Ensure that MariaDB is installed on your system.
    ```bash
    mysql --version
    ```
    If not installed, you can install it via your package manager, for example:
    ```bash
    sudo apt update
    sudo apt install mariadb-server
    ```

2. **Basic Knowledge of SQL**: Familiarity with SQL basics will be helpful.

---

## 1. Starting and Stopping MariaDB

To start the MariaDB service:

```bash
sudo systemctl start mariadb
```

To stop the MariaDB service:

```bash
sudo systemctl stop mariadb
```

To enable MariaDB to start at boot:

```bash
sudo systemctl enable mariadb
```

---

## 2. Logging into MariaDB

To log in to the MariaDB client as the root user:

```bash
sudo mysql -u root -p
```

Enter your password when prompted.

---

## 3. Basic SQL Commands in MariaDB

### Creating a Database

To create a new database:

```sql
CREATE DATABASE example_db;
```

### Selecting a Database

To use a specific database:

```sql
USE example_db;
```

### Creating a Table

To create a table named `users` with some basic fields:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Inserting Data

To insert data into the `users` table:

```sql
INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
```

### Querying Data

To retrieve all records from the `users` table:

```sql
SELECT * FROM users;
```

### Updating Data

To update a user’s name in the `users` table:

```sql
UPDATE users SET name = 'Jane Doe' WHERE id = 1;
```

### Deleting Data

To delete a user from the `users` table:

```sql
DELETE FROM users WHERE id = 1;
```

---

## 4. User Management in MariaDB

### Creating a New User

To create a new user with a password:

```sql
CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
```

### Granting Privileges

To grant all privileges on a specific database:

```sql
GRANT ALL PRIVILEGES ON example_db.* TO 'newuser'@'localhost';
```

### Revoking Privileges

To revoke privileges from a user:

```sql
REVOKE ALL PRIVILEGES ON example_db.* FROM 'newuser'@'localhost';
```

### Deleting a User

To delete a user:

```sql
DROP USER 'newuser'@'localhost';
```

---

## 5. Backing Up and Restoring Databases

### Backing Up a Database

To back up a MariaDB database using `mysqldump`:

```bash
mysqldump -u root -p example_db > example_db_backup.sql
```

### Restoring a Database

To restore a MariaDB database from a backup file:

```bash
mysql -u root -p example_db < example_db_backup.sql
```

---

## 6. Useful MariaDB Commands

### Show Databases

To list all databases:

```sql
SHOW DATABASES;
```

### Show Tables

To list all tables in the selected database:

```sql
SHOW TABLES;
```

### Describe Table Structure

To show the structure of a table:

```sql
DESCRIBE users;
```

### Exiting the MariaDB Client

To exit the MariaDB client:

```sql
EXIT;
```

---

## Summary

This tutorial introduced the basics of using MariaDB, including:

1. Starting and stopping the MariaDB service.
2. Creating and managing databases and tables.
3. Performing CRUD (Create, Read, Update, Delete) operations.
4. Managing users and privileges.
5. Backing up and restoring databases.

MariaDB is a powerful and versatile database system, well-suited for both small and large-scale applications. Experiment with SQL commands to get comfortable with database operations in MariaDB.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
