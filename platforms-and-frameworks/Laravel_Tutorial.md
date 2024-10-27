
# Laravel Tutorial

Laravel is a popular PHP framework designed for building robust, scalable, and maintainable web applications. It provides a simple and expressive syntax, tools for common web development tasks, and an ecosystem that streamlines application development.

---

## 1. Installing Laravel

### Step 1: Installing Composer

Laravel uses Composer for dependency management. Install Composer from [getcomposer.org](https://getcomposer.org/).

### Step 2: Creating a New Laravel Project

```bash
composer create-project --prefer-dist laravel/laravel myapp
cd myapp
```

Alternatively, you can install Laravel globally:

```bash
composer global require laravel/installer
laravel new myapp
cd myapp
```

### Step 3: Running the Development Server

Use the built-in server to view your application:

```bash
php artisan serve
```

Access your application at `http://localhost:8000`.

---

## 2. Laravel Application Structure

A typical Laravel application structure includes:

- **app**: Contains core application code, including Models, Controllers, and Middleware.
- **routes**: Defines application routes.
- **resources**: Holds views (Blade templates) and front-end assets.
- **config**: Stores configuration files.
- **database**: Contains migrations, seeders, and database configurations.

---

## 3. Defining Routes

Laravel routes are defined in the `routes/web.php` file.

### Example

```php
Route::get('/', function () {
    return view('welcome');
});

Route::get('/about', function () {
    return 'About Laravel';
});
```

### Route Parameters

```php
Route::get('/user/{id}', function ($id) {
    return 'User ' . $id;
});
```

---

## 4. Creating Controllers

Controllers handle the logic for your application's routes. Create a controller using the Artisan CLI:

```bash
php artisan make:controller UserController
```

### Example: UserController

In `app/Http/Controllers/UserController.php`:

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index() {
        return "Listing all users";
    }

    public function show($id) {
        return "User ID: " . $id;
    }
}
```

### Register Controller Routes

```php
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
```

---

## 5. Using Blade Templates

Blade is Laravel's templating engine, used to create dynamic views.

### Example Blade Template

Create a Blade file at `resources/views/welcome.blade.php`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Laravel App</title>
</head>
<body>
    <h1>Welcome to Laravel</h1>
    <p>{{ $message }}</p>
</body>
</html>
```

### Passing Data to Views

In your controller:

```php
public function index() {
    return view('welcome', ['message' => 'Hello, Laravel!']);
}
```

---

## 6. Working with Eloquent ORM

Eloquent is Laravel's ORM for interacting with the database.

### Creating a Model

```bash
php artisan make:model User
```

### Defining Database Tables

Eloquent maps models to database tables. To create a `users` table, define a migration:

```bash
php artisan make:migration create_users_table
```

In the migration file (`database/migrations/*_create_users_table.php`):

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamps();
});
```

Run the migration:

```bash
php artisan migrate
```

---

## 7. Database Operations with Eloquent

### Inserting Data

```php
$user = new User;
$user->name = 'Alice';
$user->email = 'alice@example.com';
$user->save();
```

### Retrieving Data

```php
$users = User::all();
$user = User::find(1);
```

### Updating Data

```php
$user = User::find(1);
$user->name = 'Alice Smith';
$user->save();
```

### Deleting Data

```php
$user = User::find(1);
$user->delete();
```

---

## 8. Form Handling and Validation

### Defining a Form

In `resources/views/form.blade.php`:

```html
<form action="/submit" method="POST">
    @csrf
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">
    <button type="submit">Submit</button>
</form>
```

### Handling the Form Request

Define the route and controller method:

```php
Route::post('/submit', [FormController::class, 'submit']);

public function submit(Request $request) {
    $request->validate([
        'name' => 'required|max:255',
    ]);
    return "Form submitted successfully!";
}
```

---

## 9. Artisan CLI

Laravel’s command-line tool, Artisan, helps with various tasks.

### Common Artisan Commands

- **Serve the application**: `php artisan serve`
- **Clear cache**: `php artisan cache:clear`
- **Create a model**: `php artisan make:model ModelName`
- **Run migrations**: `php artisan migrate`

---

## 10. Laravel Middleware

Middleware filters HTTP requests in your application.

### Creating Middleware

```bash
php artisan make:middleware CheckAge
```

In `app/Http/Middleware/CheckAge.php`:

```php
public function handle($request, Closure $next) {
    if ($request->age < 18) {
        return redirect('home');
    }
    return $next($request);
}
```

### Applying Middleware to a Route

```php
Route::get('/profile', function () {
    // Profile page
})->middleware('check.age');
```

---

## Summary

This tutorial covered Laravel basics:

1. **Installing Laravel** and setting up a project.
2. **Creating routes and controllers** to handle requests.
3. **Using Blade templates** to render views.
4. **Working with Eloquent ORM** for database operations.
5. **Handling forms and validating data**.
6. **Using Artisan and middleware** for additional functionalities.

Laravel is a powerful framework that simplifies building robust and feature-rich PHP applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
