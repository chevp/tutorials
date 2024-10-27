
# Three.js Tutorial

Three.js is a JavaScript library that makes it easy to create 3D graphics in the browser using WebGL. This tutorial covers the basics of setting up Three.js, creating a scene, adding objects, and rendering them in a web browser.

---

## Prerequisites

1. **Basic Knowledge of JavaScript and HTML**: Familiarity with JavaScript programming and basic HTML is recommended.
2. **A Code Editor**: Use any text editor like VS Code, Sublime Text, or Atom.

---

## 1. Setting Up a Three.js Project

You can use a CDN link to include Three.js in your project or install it with npm if using a build tool.

### Option 1: Using a CDN

Add the following `<script>` tag in the `<head>` section of your HTML file to use Three.js via CDN:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

### Option 2: Installing Three.js via npm

If you’re using a build tool like Webpack or Parcel, install Three.js with npm:

```bash
npm install three
```

---

## 2. Setting Up the HTML File

Create an `index.html` file to hold your Three.js setup:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js Scene</title>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

---

## 3. Creating a Basic Scene

Create a file named `app.js` and add the following code to set up a basic scene with a camera and a renderer.

### Step 1: Set Up the Scene

```javascript
// Create a scene
const scene = new THREE.Scene();

// Set up the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Set up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

This code initializes a scene, sets up a perspective camera, and configures the renderer.

---

## 4. Adding a Basic Object

Let’s add a simple cube to the scene.

### Step 1: Create Geometry, Material, and Mesh

```javascript
// Create a box geometry
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

// Add the cube to the scene
scene.add(cube);
```

This code creates a green cube using basic geometry and material.

### Step 2: Animation Loop

Add an animation loop to render the scene and rotate the cube.

```javascript
function animate() {
    requestAnimationFrame(animate);

    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();
```

This `animate` function is called repeatedly to update the scene and render it on the screen.

---

## 5. Adding Lights

To make 3D objects look more realistic, you can add lights.

### Step 1: Add a Point Light

Replace the material with `MeshPhongMaterial` to make it responsive to light:

```javascript
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
```

### Step 2: Add Light to the Scene

Add the following code to create and position a light source:

```javascript
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);
```

Now, the cube will reflect light and have a more three-dimensional appearance.

---

## 6. Adding a Background Color

Set a background color for the scene:

```javascript
renderer.setClearColor(0x123456);
```

This changes the scene background color to a hex value (e.g., `#123456`).

---

## 7. Handling Window Resize

To make the scene responsive, update the camera and renderer when the window is resized.

```javascript
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
```

This code ensures the 3D scene resizes with the browser window.

---

## Summary

This tutorial introduced the basics of creating a 3D scene with Three.js:

1. Setting up a scene, camera, and renderer.
2. Adding a basic object (cube) to the scene.
3. Adding lights to enhance visual depth.
4. Implementing an animation loop to render changes continuously.
5. Adjusting the scene to be responsive to window resizing.

Three.js provides a powerful framework for creating 3D graphics on the web. You can expand on this setup by adding textures, more complex geometries, and interactive elements.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
