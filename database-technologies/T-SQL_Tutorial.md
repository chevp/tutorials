# T-SQL Tutorial

This guide introduces the essential concepts, commands, and features of T-SQL, helping you write efficient and powerful database queries.

## Introduction to T-SQL
T-SQL is Microsoft SQL Server's procedural extension of SQL. It builds on standard SQL by adding programming constructs such as variables, loops, and error handling, making it powerful for complex database operations.

---

## Basic T-SQL Commands
Here are some basic T-SQL commands:

### 1. SELECT Statement
Retrieve data from a table.
```sql
SELECT Column1, Column2
FROM TableName
WHERE Condition;
```

### 2. INSERT Statement
Insert data into a table.
```sql
INSERT INTO TableName (Column1, Column2)
VALUES (Value1, Value2);
```

### 3. UPDATE Statement
Update existing data in a table.
```sql
UPDATE TableName
SET Column1 = Value1
WHERE Condition;
```

### 4. DELETE Statement
Delete data from a table.
```sql
DELETE FROM TableName
WHERE Condition;
```

---

## Control-of-Flow Statements
T-SQL provides control-of-flow statements for conditional logic and loops.

### 1. IF...ELSE
```sql
IF Condition
    BEGIN
        -- Code block if condition is true
    END
ELSE
    BEGIN
        -- Code block if condition is false
    END;
```

### 2. WHILE Loop
```sql
WHILE Condition
    BEGIN
        -- Code block
    END;
```

---

## Working with Variables

### Declare and Set Variables
```sql
DECLARE @VariableName DataType;
SET @VariableName = Value;
```

### Example
```sql
DECLARE @Count INT;
SET @Count = 10;
PRINT @Count;
```

---

## Joins and Subqueries

### Joins
Combine data from multiple tables.

#### Inner Join
```sql
SELECT A.Column1, B.Column2
FROM TableA A
INNER JOIN TableB B
ON A.ID = B.ID;
```

#### Left Join
```sql
SELECT A.Column1, B.Column2
FROM TableA A
LEFT JOIN TableB B
ON A.ID = B.ID;
```

### Subqueries
Nested queries inside another query.
```sql
SELECT Column1
FROM Table
WHERE Column2 = (SELECT MAX(Column2) FROM Table);
```

---

## Common Table Expressions (CTEs)
CTEs simplify complex queries by creating temporary result sets.

### Example
```sql
WITH CTE_Name AS (
    SELECT Column1, Column2
    FROM TableName
    WHERE Condition
)
SELECT * FROM CTE_Name;
```

---

## Stored Procedures
Stored procedures are reusable scripts stored on the database server.

### Create a Stored Procedure
```sql
CREATE PROCEDURE ProcedureName
    @Parameter DataType
AS
BEGIN
    SELECT Column1
    FROM TableName
    WHERE Column2 = @Parameter;
END;
```

### Execute a Stored Procedure
```sql
EXEC ProcedureName @Parameter = Value;
```

---

## Triggers
Triggers execute automatically in response to specific events.

### Example: AFTER INSERT Trigger
```sql
CREATE TRIGGER TriggerName
ON TableName
AFTER INSERT
AS
BEGIN
    PRINT 'Row inserted.';
END;
```

---

## Error Handling
Handle errors gracefully with `TRY...CATCH` blocks.

### Example
```sql
BEGIN TRY
    -- Code that may cause an error
    SELECT 1 / 0;
END TRY
BEGIN CATCH
    PRINT 'An error occurred: ' + ERROR_MESSAGE();
END CATCH;
```

---

## Useful Built-In Functions

### String Functions
- `LEN()`: Get string length.
- `SUBSTRING()`: Extract substring.

### Date Functions
- `GETDATE()`: Current date and time.
- `DATEADD()`: Add to a date.

### Aggregate Functions
- `SUM()`, `AVG()`, `MIN()`, `MAX()`, `COUNT()`.

### Example
```sql
SELECT LEN('Hello'), GETDATE(), SUM(Column1)
FROM TableName;
```

---

## Conclusion
This tutorial covers the basics and advanced features of T-SQL. Practice these concepts to master database operations in Microsoft SQL Server.


## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).