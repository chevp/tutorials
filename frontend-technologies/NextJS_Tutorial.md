
# Next.js Tutorial

Next.js is a React framework that enables server-side rendering, static site generation, and other advanced features out of the box. It's widely used for building optimized, production-ready web applications.

---

## 1. Setting Up a Next.js Project

Next.js uses `create-next-app` to quickly set up a project with all necessary configurations.

### Step 1: Install `create-next-app`

Run the following command to create a new Next.js application:

```bash
npx create-next-app@latest my-next-app
cd my-next-app
```

### Step 2: Start the Development Server

Start the development server to view your app at `http://localhost:3000`:

```bash
npm run dev
```

---

## 2. Pages and Routing

In Next.js, each file in the `pages` directory represents a route. This file-based routing simplifies navigation setup.

### Example

1. Create a new file, `about.js`, in the `pages` directory:

    ```javascript
    export default function About() {
        return <h1>About Page</h1>;
    }
    ```

2. Visit `http://localhost:3000/about` to see the new page.

---

## 3. Linking Between Pages

Use Next.js’s `Link` component for client-side navigation between pages.

### Example

```javascript
import Link from 'next/link';

export default function Home() {
    return (
        <div>
            <h1>Home Page</h1>
            <Link href="/about">Go to About Page</Link>
        </div>
    );
}
```

---

## 4. Static and Server-Side Rendering

Next.js supports **Static Generation** and **Server-Side Rendering**.

### Static Generation

Create static pages at build time using `getStaticProps`.

```javascript
export async function getStaticProps() {
    return {
        props: { message: "Hello from Static Generation" },
    };
}

export default function Home({ message }) {
    return <h1>{message}</h1>;
}
```

### Server-Side Rendering

Fetch data on each request using `getServerSideProps`.

```javascript
export async function getServerSideProps() {
    return {
        props: { message: "Hello from Server-Side Rendering" },
    };
}

export default function Home({ message }) {
    return <h1>{message}</h1>;
}
```

---

## 5. API Routes

Next.js can handle API routes. Each file in the `pages/api` directory acts as an API endpoint.

### Example

Create `hello.js` in `pages/api`:

```javascript
export default function handler(req, res) {
    res.status(200).json({ message: "Hello from API" });
}
```

Visit `http://localhost:3000/api/hello` to see the response.

---

## 6. Custom Components and Layouts

To add custom layouts, wrap pages with a layout component.

### Example Layout

1. Create `components/Layout.js`:

    ```javascript
    export default function Layout({ children }) {
        return (
            <div>
                <header>Header</header>
                <main>{children}</main>
                <footer>Footer</footer>
            </div>
        );
    }
    ```

2. Wrap the Home page with the layout:

    ```javascript
    import Layout from '../components/Layout';

    export default function Home() {
        return (
            <Layout>
                <h1>Home Page</h1>
            </Layout>
        );
    }
    ```

---

## 7. CSS in Next.js

Next.js supports multiple ways to style applications:

- **CSS Modules**: Scoped styles in `.module.css` files.
- **Global CSS**: Global stylesheets added in `_app.js`.
- **Styled Components**: CSS-in-JS library.

### Example with CSS Modules

1. Create `Home.module.css`:

    ```css
    .title {
        color: blue;
    }
    ```

2. Import and use in your component:

    ```javascript
    import styles from './Home.module.css';

    export default function Home() {
        return <h1 className={styles.title}>Home Page</h1>;
    }
    ```

---

## 8. Deploying a Next.js App

Deploying a Next.js app is straightforward, especially with Vercel (Next.js's creators).

1. **Deploy with Vercel**: Sign up at [vercel.com](https://vercel.com/), connect your Git repository, and follow the instructions.
2. **Custom Deployment**: Export your project as static files using `next export` or deploy it to any server that supports Node.js.

---

## Summary

This tutorial covered the basics of using Next.js:

1. Setting up a Next.js project.
2. Working with pages and routing.
3. Handling static and server-side rendering.
4. Adding API routes and custom layouts.
5. Using CSS in Next.js.

Next.js simplifies React development by providing server-side rendering, static generation, and a rich ecosystem of tools for building modern web applications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
