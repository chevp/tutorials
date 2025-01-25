# SQL Server Tutorial

This guide introduces you to Microsoft SQL Server, its features, and essential commands for managing databases.

## What is SQL Server?
Microsoft SQL Server is a relational database management system (RDBMS) developed by Microsoft. It is used to store, retrieve, and manage data for various applications.

### Key Features:
- Scalable and secure database engine.
- Support for T-SQL (Transact-SQL).
- Integration with Microsoft tools (Power BI, Azure, etc.).
- High Availability and Disaster Recovery options.

---

## Getting Started with SQL Server

### 1. Installation
- Download and install SQL Server from the [official website](https://www.microsoft.com/sql-server).
- Install SQL Server Management Studio (SSMS) for managing databases through a graphical interface.

### 2. Connecting to SQL Server
- Open SSMS.
- Connect to your SQL Server instance using the server name, authentication type, and credentials.

### 3. Creating a Database
```sql
CREATE DATABASE SampleDB;
GO
```

### 4. Selecting the Database
```sql
USE SampleDB;
GO
```

---

## Basic SQL Server Commands

### 1. Creating a Table
```sql
CREATE TABLE Employees (
    EmployeeID INT PRIMARY KEY,
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    HireDate DATE
);
GO
```

### 2. Inserting Data
```sql
INSERT INTO Employees (EmployeeID, FirstName, LastName, HireDate)
VALUES (1, 'John', 'Doe', '2023-01-01');
GO
```

### 3. Retrieving Data
```sql
SELECT * FROM Employees;
GO
```

### 4. Updating Data
```sql
UPDATE Employees
SET LastName = 'Smith'
WHERE EmployeeID = 1;
GO
```

### 5. Deleting Data
```sql
DELETE FROM Employees
WHERE EmployeeID = 1;
GO
```

### 6. Dropping a Table
```sql
DROP TABLE Employees;
GO
```

---

## Data Types in SQL Server
SQL Server supports a variety of data types:

### Numeric Data Types
- `INT`, `BIGINT`, `SMALLINT`, `TINYINT`
- `DECIMAL`, `NUMERIC`, `FLOAT`, `REAL`

### Character Data Types
- `CHAR`, `VARCHAR`
- `NCHAR`, `NVARCHAR` (Unicode)

### Date and Time Data Types
- `DATE`, `DATETIME`, `DATETIME2`, `TIME`

### Other Data Types
- `BIT` (Boolean)
- `BINARY`, `VARBINARY`
- `UNIQUEIDENTIFIER` (GUID)

---

## Constraints in SQL Server
Constraints are rules applied to table columns to enforce data integrity.

### Common Constraints:
1. **Primary Key**: Uniquely identifies each row.
    ```sql
    ALTER TABLE Employees ADD CONSTRAINT PK_Employees PRIMARY KEY (EmployeeID);
    ```
2. **Foreign Key**: Links two tables.
    ```sql
    ALTER TABLE Orders
    ADD CONSTRAINT FK_Orders_Employees FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID);
    ```
3. **Check**: Ensures column values meet a condition.
    ```sql
    ALTER TABLE Employees ADD CONSTRAINT CHK_HireDate CHECK (HireDate > '2000-01-01');
    ```
4. **Default**: Sets a default value for a column.
    ```sql
    ALTER TABLE Employees ADD CONSTRAINT DF_HireDate DEFAULT GETDATE() FOR HireDate;
    ```

---

## Advanced SQL Server Features

### 1. Views
A view is a virtual table based on a query.
```sql
CREATE VIEW EmployeeView AS
SELECT FirstName, LastName
FROM Employees;
GO
```

### 2. Stored Procedures
Stored procedures are reusable blocks of T-SQL code.
```sql
CREATE PROCEDURE GetEmployeeByID @EmployeeID INT
AS
BEGIN
    SELECT * FROM Employees WHERE EmployeeID = @EmployeeID;
END;
GO

EXEC GetEmployeeByID @EmployeeID = 1;
```

### 3. Triggers
Triggers automatically execute in response to database events.
```sql
CREATE TRIGGER trgAfterInsert
ON Employees
AFTER INSERT
AS
BEGIN
    PRINT 'A new employee record was added.'
END;
GO
```

---

## Backup and Restore

### 1. Backing Up a Database
```sql
BACKUP DATABASE SampleDB
TO DISK = 'C:\Backups\SampleDB.bak';
GO
```

### 2. Restoring a Database
```sql
RESTORE DATABASE SampleDB
FROM DISK = 'C:\Backups\SampleDB.bak';
GO
```

---

## Useful Built-In Functions

### 1. String Functions
- `LEN()`: Returns string length.
- `SUBSTRING()`: Extracts part of a string.
- `UPPER()`, `LOWER()`: Converts case.

### 2. Date Functions
- `GETDATE()`: Returns current date and time.
- `DATEADD()`: Adds a date interval.
- `DATEDIFF()`: Calculates the difference between dates.

### Example:
```sql
SELECT GETDATE() AS CurrentDate,
       DATEADD(DAY, 7, GETDATE()) AS NextWeek,
       DATEDIFF(DAY, '2023-01-01', GETDATE()) AS DaysSinceStartOfYear;
GO
```

---

## Conclusion

This tutorial provides a comprehensive introduction to SQL Server. Practice these commands and explore advanced features to master database management.


## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).