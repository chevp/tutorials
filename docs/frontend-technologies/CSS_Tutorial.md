
# CSS Tutorial

CSS (Cascading Style Sheets) is a language used to describe the style of HTML documents. CSS controls the look and feel of a website, allowing you to change colors, layout, fonts, and more. This tutorial covers the basics of using CSS to style HTML.

---

## 1. CSS Syntax

CSS styles are written as rules. Each rule has a selector, followed by a declaration block enclosed in curly braces (`{}`). Declarations are written as `property: value;` pairs.

### Example

```css
h1 {
    color: blue;
    font-size: 24px;
}
```

In this example, the `h1` selector applies styles to all `<h1>` elements, setting their color to blue and font size to 24 pixels.

---

## 2. Adding CSS to HTML

CSS can be added in three main ways:

### Inline CSS

Add CSS directly to an HTML element’s `style` attribute.

```html
<h1 style="color: blue;">Hello, World!</h1>
```

### Internal CSS

Use the `<style>` tag within the `<head>` section of your HTML file.

```html
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
    </style>
</head>
```

### External CSS

Link an external CSS file to your HTML document using the `<link>` tag.

```html
<head>
    <link rel="stylesheet" href="styles.css">
</head>
```

---

## 3. Selectors

### Type Selector

Selects all elements of a given type.

```css
p {
    color: green;
}
```

### Class Selector

Selects elements with a specific class. Classes are prefixed with a dot (`.`).

```css
.header {
    background-color: yellow;
}
```

### ID Selector

Selects elements with a specific ID. IDs are prefixed with a hash (`#`).

```css
#main-title {
    font-weight: bold;
}
```

### Attribute Selector

Selects elements with a specific attribute.

```css
input[type="text"] {
    border: 1px solid black;
}
```

---

## 4. Common Properties

### Colors

- **Text Color**: `color`
- **Background Color**: `background-color`

```css
p {
    color: red;
    background-color: yellow;
}
```

### Fonts

- **Font Size**: `font-size`
- **Font Family**: `font-family`
- **Font Weight**: `font-weight`

```css
h1 {
    font-size: 2em;
    font-family: Arial, sans-serif;
    font-weight: bold;
}
```

### Borders and Padding

- **Border**: `border`
- **Padding**: `padding`
- **Margin**: `margin`

```css
.box {
    border: 1px solid black;
    padding: 10px;
    margin: 20px;
}
```

---

## 5. Layout with Flexbox

Flexbox is a CSS layout module that makes it easier to design flexible and responsive layouts.

```css
.container {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

### Flexbox Properties

- **justify-content**: Aligns items along the main axis.
- **align-items**: Aligns items along the cross axis.

---

## 6. Responsive Design

CSS media queries allow you to apply styles based on the device's characteristics.

### Example

```css
@media (max-width: 600px) {
    body {
        font-size: 14px;
    }
}
```

This applies a font size of 14px when the viewport width is 600px or smaller.

---

## Summary

This tutorial covered CSS basics:

1. Writing CSS rules and adding them to HTML.
2. Using selectors to target elements.
3. Applying common CSS properties for colors, fonts, and layout.
4. Designing responsive layouts with Flexbox and media queries.

CSS gives you control over your web content's presentation, enabling you to create visually appealing and responsive websites.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
