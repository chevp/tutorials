# Angular Structural Directives Tutorial

## Introduction
Structural directives in Angular modify the structure of the DOM by adding or removing elements. The most commonly used structural directives are `*ngIf`, `*ngFor`, and `*ngSwitch`. This tutorial covers their usage with examples.

---

## 1. What are Structural Directives?
Structural directives are special attributes prefixed with `*`, which indicate they change the structure of the DOM. Unlike attribute directives, they affect how elements are added or removed dynamically.

### Common Structural Directives:
- `*ngIf` - Conditionally renders elements.
- `*ngFor` - Iterates over a collection.
- `*ngSwitch` - Displays elements conditionally based on a value.

---

## 2. Using `*ngIf`
The `*ngIf` directive conditionally renders an element based on a boolean expression.

### Example:
```html
<div *ngIf="isVisible">
  This text is visible when isVisible is true.
</div>
```

### Using `else`:
```html
<div *ngIf="isLoggedIn; else loggedOut">
  Welcome, User!
</div>
<ng-template #loggedOut>
  <p>Please log in.</p>
</ng-template>
```

---

## 3. Using `*ngFor`
The `*ngFor` directive loops through an array and renders an element for each item.

### Example:
```html
<ul>
  <li *ngFor="let item of items">
    {{ item }}
  </li>
</ul>
```

### Using Index:
```html
<ul>
  <li *ngFor="let item of items; let i = index">
    {{ i + 1 }}. {{ item }}
  </li>
</ul>
```

### Optimizing with `trackBy`:
```html
<li *ngFor="let user of users; trackBy: trackByFn">
  {{ user.name }}
</li>
```
```typescript
trackByFn(index: number, user: any): number {
  return user.id;
}
```

---

## 4. Using `*ngSwitch`
The `*ngSwitch` directive conditionally renders elements based on a selected value.

### Example:
```html
<div [ngSwitch]="userRole">
  <p *ngSwitchCase="'admin'">Admin Panel</p>
  <p *ngSwitchCase="'user'">User Dashboard</p>
  <p *ngSwitchDefault>Guest View</p>
</div>
```

---

## Conclusion

Angular structural directives help manage dynamic rendering efficiently. Understanding `*ngIf`, `*ngFor`, and `*ngSwitch` will improve your ability to create flexible, dynamic applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
