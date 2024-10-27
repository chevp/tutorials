
# SCSS Tutorial

SCSS (Sassy CSS) is a preprocessor language that extends CSS with features like variables, nesting, and mixins. SCSS is one of two syntax options in the Sass language and is compatible with CSS, making it easier to write organized and maintainable stylesheets.

---

## 1. Setting Up SCSS

To compile SCSS to CSS, you need a Sass compiler. If you haven’t already, install Sass globally with npm:

```bash
npm install -g sass
```

Compile an SCSS file to CSS with:

```bash
sass input.scss output.css
```

---

## 2. Basic Syntax

SCSS files use the `.scss` extension and can include plain CSS, along with SCSS-specific features.

### Example

```scss
$primary-color: #3498db;

body {
  font-family: Arial, sans-serif;
  color: $primary-color;
}
```

---

## 3. Variables

Variables in SCSS allow you to store values (e.g., colors, fonts) for reuse.

```scss
$font-stack: Helvetica, sans-serif;
$primary-color: #333;

body {
  font: 100% $font-stack;
  color: $primary-color;
}
```

---

## 4. Nesting

SCSS allows you to nest selectors within each other, following the same hierarchy as HTML.

### Example

```scss
nav {
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li { display: inline-block; }
  a { color: blue; }
}
```

---

## 5. Partials and Importing

SCSS allows you to split code into multiple files, known as partials. Partial files begin with an underscore (e.g., `_variables.scss`). Import partials using the `@import` directive.

### Example

```scss
// _variables.scss
$primary-color: #3498db;

// main.scss
@import 'variables';

body {
  color: $primary-color;
}
```

---

## 6. Mixins

Mixins let you create reusable blocks of styles. Define a mixin with `@mixin` and include it with `@include`.

### Example

```scss
@mixin button-style($color) {
  background-color: $color;
  border: none;
  padding: 10px;
}

button {
  @include button-style(blue);
}
```

---

## 7. Extending and Inheritance

Use `@extend` to share CSS properties between selectors.

### Example

```scss
.message {
  padding: 10px;
  border-radius: 5px;
}

.success {
  @extend .message;
  background-color: green;
}
```

---

## 8. Functions

SCSS allows you to create custom functions.

### Example

```scss
@function calculate-rem($size) {
  @return $size / 16 * 1rem;
}

body {
  font-size: calculate-rem(18px);
}
```

---

## Summary

This tutorial covered SCSS basics:

1. Setting up SCSS and compiling it to CSS.
2. Using SCSS features like variables, nesting, mixins, and functions.
3. Creating partials and importing them.

SCSS enhances CSS with powerful features, making it easier to write and maintain large stylesheets.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
