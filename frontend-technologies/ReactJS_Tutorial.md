
# ReactJS Tutorial

ReactJS is a JavaScript library used to build dynamic user interfaces. It is component-based and declarative, making it efficient for creating large, complex applications. This tutorial covers the basics of setting up React, building components, and managing state.

---

## 1. Setting Up a React Project

### Using `create-react-app`

`create-react-app` is a command-line tool that sets up a React project with all necessary configurations.

1. **Install** `create-react-app` globally (if not installed):

    ```bash
    npm install -g create-react-app
    ```

2. **Create a new React project**:

    ```bash
    npx create-react-app my-app
    cd my-app
    ```

3. **Start the development server**:

    ```bash
    npm start
    ```

This will start the app at `http://localhost:3000`.

---

## 2. React Components

Components are the building blocks of a React app. Each component represents a part of the UI.

### Functional Component

```javascript
import React from 'react';

function Greeting() {
    return <h1>Hello, World!</h1>;
}

export default Greeting;
```

### Class Component

```javascript
import React, { Component } from 'react';

class Greeting extends Component {
    render() {
        return <h1>Hello, World!</h1>;
    }
}

export default Greeting;
```

---

## 3. JSX (JavaScript XML)

JSX is a syntax extension for JavaScript that looks similar to HTML. It allows you to write HTML-like code within JavaScript.

### Example

```javascript
const element = <h1>Hello, World!</h1>;
```

**Notes**:

- JSX must have a single parent element.
- Use curly braces `{}` to embed JavaScript expressions.

---

## 4. Props (Properties)

Props are used to pass data from a parent component to a child component.

### Example

```javascript
function Welcome(props) {
    return <h1>Hello, {props.name}!</h1>;
}

function App() {
    return <Welcome name="Alice" />;
}
```

In this example, `"Alice"` is passed as a prop to `Welcome`.

---

## 5. State

State is a way to store dynamic data within a component. It is managed within the component and can change over time.

### Example using `useState` Hook

```javascript
import React, { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>Click me</button>
        </div>
    );
}
```

### Class Component with State

```javascript
import React, { Component } from 'react';

class Counter extends Component {
    state = { count: 0 };

    increment = () => {
        this.setState({ count: this.state.count + 1 });
    };

    render() {
        return (
            <div>
                <p>Count: {this.state.count}</p>
                <button onClick={this.increment}>Increment</button>
            </div>
        );
    }
}
```

---

## 6. Handling Events

Events in React are handled similarly to JavaScript, but they follow camelCase naming, and you pass a function reference instead of a string.

### Example

```javascript
function Button() {
    function handleClick() {
        alert('Button clicked!');
    }

    return <button onClick={handleClick}>Click me</button>;
}
```

---

## 7. Conditional Rendering

React allows you to conditionally render components or elements.

### Example

```javascript
function Message({ isLoggedIn }) {
    return isLoggedIn ? <h1>Welcome back!</h1> : <h1>Please log in.</h1>;
}
```

---

## 8. Lists and Keys

When rendering lists, each list item should have a unique `key` to help React identify changes.

### Example

```javascript
function NameList() {
    const names = ['Alice', 'Bob', 'Charlie'];
    return (
        <ul>
            {names.map((name) => (
                <li key={name}>{name}</li>
            ))}
        </ul>
    );
}
```

---

## 9. Lifecycle Methods (Class Components)

Lifecycle methods are functions that get called at different stages of a component’s life. They only work in class components.

- **componentDidMount**: Called after the component is added to the DOM.
- **componentDidUpdate**: Called after the component is updated.
- **componentWillUnmount**: Called before the component is removed.

---

## 10. React Hooks

Hooks allow you to use state and lifecycle features in functional components.

### Common Hooks

- **useState**: Adds state to functional components.
- **useEffect**: Runs side effects (e.g., data fetching, subscriptions).

### Example of `useEffect`

```javascript
import React, { useState, useEffect } from 'react';

function Timer() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCount((prev) => prev + 1), 1000);
        return () => clearInterval(timer); // Cleanup on unmount
    }, []);

    return <h1>Timer: {count}</h1>;
}
```

---

## Summary

This tutorial covered the basics of ReactJS:

1. Setting up a project with `create-react-app`.
2. Building components and managing state with hooks.
3. Handling props, events, and conditional rendering.
4. Understanding component lifecycle and React Hooks.

React is a powerful library that simplifies the process of building dynamic, responsive user interfaces.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
