
# Entity Framework Tutorial for .NET

## Introduction
Entity Framework (EF) is an Object-Relational Mapping (ORM) framework for .NET that allows developers to work with databases using C# objects. EF simplifies database operations by eliminating the need to write raw SQL for common tasks, providing an easy-to-use framework to interact with data.

There are two main versions:
- **Entity Framework 6 (EF6)**: The version designed for the .NET Framework.
- **Entity Framework Core (EF Core)**: A modern, cross-platform, and lightweight version designed for .NET Core and .NET 5+.

In this tutorial, we will focus on **Entity Framework Core**, as it is the most widely used version today.

## Prerequisites
Before starting, ensure you have the following:
- **.NET SDK** installed on your system.
- A **code editor**, like [Visual Studio Code](https://code.visualstudio.com/) or [Visual Studio](https://visualstudio.microsoft.com/).
- **SQL Server** (or another database) installed locally or using a cloud service (like Azure SQL Database).

## Step 1: Creating a New .NET Core Project

1. Open your terminal or command prompt.
2. Run the following command to create a new console application:
    ```bash
    dotnet new console -n EFCoreTutorial
    cd EFCoreTutorial
    ```

3. Add **Entity Framework Core** to your project:
    ```bash
    dotnet add package Microsoft.EntityFrameworkCore
    dotnet add package Microsoft.EntityFrameworkCore.SqlServer
    dotnet add package Microsoft.EntityFrameworkCore.Design
    ```

## Step 2: Create the Data Model

Now, let's define a simple model class to represent a database table. For example, a `Product` class:

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

This class will be used by EF Core to map to a database table named `Products`.

## Step 3: Create a DbContext Class

A **DbContext** represents a session with the database and allows querying and saving data. Create a new class `AppDbContext` that inherits from `DbContext`:

```csharp
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Product> Products { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer("Your_Connection_String_Here");
    }
}
```

Replace `"Your_Connection_String_Here"` with your actual SQL Server connection string.

## Step 4: Perform Database Migrations

EF Core provides migrations to keep your database schema in sync with your model. Here’s how to create the database schema:

1. In the terminal, run:
    ```bash
    dotnet ef migrations add InitialCreate
    ```
    This will create the first migration to create the database schema.

2. To apply the migration and create the database, run:
    ```bash
    dotnet ef database update
    ```

## Step 5: Insert Data into the Database

Now, let’s insert some sample data into the database using EF Core. Update the `Program.cs` file:

```csharp
using (var context = new AppDbContext())
{
    // Ensure the database is created
    context.Database.EnsureCreated();

    // Add a new product
    var product = new Product
    {
        Name = "Laptop",
        Price = 1200.00m
    };
    context.Products.Add(product);
    context.SaveChanges();
}
```

## Step 6: Query Data from the Database

To retrieve data from the database, you can use LINQ queries with EF Core:

```csharp
using (var context = new AppDbContext())
{
    var products = context.Products.ToList();

    foreach (var product in products)
    {
        Console.WriteLine($"Id: {product.Id}, Name: {product.Name}, Price: {product.Price}");
    }
}
```

## Step 7: Update and Delete Data

### Update Data
To update a product:

```csharp
using (var context = new AppDbContext())
{
    var product = context.Products.First();
    product.Price = 1300.00m;
    context.SaveChanges();
}
```

### Delete Data
To delete a product:

```csharp
using (var context = new AppDbContext())
{
    var product = context.Products.First();
    context.Products.Remove(product);
    context.SaveChanges();
}
```

## Conclusion

This simple tutorial covered the basics of Entity Framework Core in .NET, including setting up a DbContext, creating a model, performing database migrations, and basic CRUD operations. EF Core makes working with databases in .NET easy and efficient, allowing developers to focus more on writing code and less on SQL.

For more advanced topics, explore:
- **Relationships** (One-to-Many, Many-to-Many)
- **Data Seeding**
- **Custom Queries and Raw SQL**
- **Performance Optimization**

## Resources
- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [EF Core Migrations](https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server)

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).

