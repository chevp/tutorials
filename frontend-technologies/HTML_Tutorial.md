
# HTML Tutorial

HTML (HyperText Markup Language) is the standard language used to create and structure web pages. HTML elements are represented by tags that provide structure and content for a webpage. This tutorial covers the basics of HTML to help you get started.

---

## 1. Basic Structure of an HTML Document

Every HTML document starts with a `<!DOCTYPE html>` declaration and has a root `<html>` element. Inside `<html>`, there are two main sections: `<head>` and `<body>`.

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First HTML Page</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This is a simple paragraph.</p>
</body>
</html>
```

---

## 2. HTML Elements

HTML elements are represented by tags, which usually come in pairs: an opening tag and a closing tag.

### Example

```html
<p>This is a paragraph.</p>
```

### Common Elements

- **Headings**: `<h1>` to `<h6>` represent headings, with `<h1>` being the largest.
- **Paragraph**: `<p>` for paragraphs.
- **Links**: `<a href="url">Text</a>` for hyperlinks.
- **Images**: `<img src="url" alt="description">` for images.

---

## 3. Attributes

Attributes provide additional information about elements and are placed in the opening tag.

### Example

```html
<a href="https://example.com" target="_blank">Visit Example</a>
```

In this example:
- `href` specifies the URL.
- `target="_blank"` opens the link in a new tab.

---

## 4. Lists

HTML provides two main types of lists:

### Ordered List

An ordered list (`<ol>`) displays items with numbers.

```html
<ol>
    <li>First item</li>
    <li>Second item</li>
</ol>
```

### Unordered List

An unordered list (`<ul>`) displays items with bullets.

```html
<ul>
    <li>Item one</li>
    <li>Item two</li>
</ul>
```

---

## 5. Tables

Tables organize data in rows and columns.

### Example

```html
<table>
    <tr>
        <th>Name</th>
        <th>Age</th>
    </tr>
    <tr>
        <td>John Doe</td>
        <td>30</td>
    </tr>
</table>
```

- `<th>` defines a table header.
- `<td>` defines a table data cell.

---

## 6. Forms

Forms allow users to enter and submit data.

### Example

```html
<form action="/submit" method="post">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">
    <input type="submit" value="Submit">
</form>
```

- `action` specifies the URL where the form data is sent.
- `method` defines the HTTP method (`get` or `post`) for submitting data.

---

## 7. Semantic HTML Elements

Semantic elements describe their content's role in the webpage. Examples include `<header>`, `<footer>`, `<article>`, `<section>`, and `<nav>`.

### Example

```html
<header>
    <h1>My Website</h1>
    <nav>
        <a href="#home">Home</a>
        <a href="#about">About</a>
    </nav>
</header>
<section>
    <h2>About Us</h2>
    <p>Welcome to our website.</p>
</section>
<footer>
    <p>© 2023 My Website</p>
</footer>
```

---

## Summary

This tutorial covered HTML basics:

1. Creating a basic HTML structure.
2. Using common elements like headings, paragraphs, lists, and tables.
3. Adding attributes to elements for more functionality.
4. Building forms to collect data.
5. Using semantic elements for better readability and accessibility.

HTML is the foundation of web development, providing the structure for webpages that can then be styled with CSS and made interactive with JavaScript.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
