
# Three.js 3D Rendering Tutorial

Three.js is a powerful JavaScript library that simplifies the process of creating and rendering 3D graphics in web browsers. This tutorial will guide you through the steps to set up a basic 3D rendering scene using Three.js.

---

## 1. Introduction to Three.js

Three.js is built on top of WebGL, providing a more user-friendly API to work with 3D graphics. With Three.js, you can create complex 3D scenes, animations, and interactive experiences with ease.

### Key Concepts

- **Scene**: A container for all 3D objects, lights, and cameras.
- **Camera**: Defines what perspective the scene is viewed from.
- **Renderer**: Renders the scene from the perspective of the camera.

---

## 2. Setting Up Your Environment

### Step 1: Include Three.js

You can include Three.js in your project by using a CDN or by downloading the library.

**Using a CDN**:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

### Step 2: Create an HTML File

Create a basic HTML file to set up your scene:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js 3D Rendering</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

### Step 3: Create the JavaScript File

Create a `script.js` file where you will write your Three.js code.

---

## 3. Creating a Basic Scene

### Step 1: Initialize the Scene

In `script.js`, start by setting up the scene, camera, and renderer:

```javascript
// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Move the camera back

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // Attach the renderer to the DOM
```

### Step 2: Add a 3D Object

Add a simple geometry, such as a cube, to the scene:

```javascript
// Create a geometry and a material
const geometry = new THREE.BoxGeometry(1, 1, 1); // Width, Height, Depth
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color

// Create a mesh from the geometry and material
const cube = new THREE.Mesh(geometry, material);

// Add the cube to the scene
scene.add(cube);
```

### Step 3: Render the Scene

Create an animation loop to render the scene continuously:

```javascript
function animate() {
    requestAnimationFrame(animate); // Call animate again for the next frame

    // Rotate the cube for a simple animation
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera); // Render the scene from the perspective of the camera
}

animate(); // Start the animation loop
```

---

## 4. Adding Lights

To enhance the visual quality of your scene, add lights:

```javascript
// Add a directional light
const light = new THREE.DirectionalLight(0xffffff, 1); // White light with full intensity
light.position.set(5, 5, 5); // Set the light position
scene.add(light); // Add light to the scene
```

---

## 5. Handling Window Resizing

Make your scene responsive by handling window resizing:

```javascript
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect ratio
    camera.updateProjectionMatrix(); // Update the projection matrix
    renderer.setSize(window.innerWidth, window.innerHeight); // Resize the renderer
});
```

---

## 6. Conclusion

In this tutorial, you learned how to set up a basic 3D rendering scene using Three.js, including creating a scene, adding a 3D object, implementing lighting, and making the canvas responsive. With this foundation, you can explore more advanced features of Three.js, such as textures, animations, and interactions.

### Further Reading

- [Three.js Documentation](https://threejs.org/docs/index.html)
- [Three.js Examples](https://threejs.org/examples/)
- [Three.js GitHub Repository](https://github.com/mrdoob/three.js)

---

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
