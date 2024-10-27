
# Three.js Cameras Tutorial

Cameras are essential for viewing and rendering 3D scenes in Three.js. They define the perspective from which the scene is viewed. This tutorial will guide you through the different types of cameras available in Three.js and how to set them up in your projects.

---

## 1. Introduction to Cameras

In Three.js, cameras determine what part of the scene is visible. They have properties that define their position, direction, and perspective. There are several types of cameras, each suitable for different applications.

### Key Camera Types

- **PerspectiveCamera**: Mimics the way human eyes perceive the world, with objects appearing smaller as they are further away.
- **OrthographicCamera**: Represents a parallel projection, where objects retain their size regardless of their distance from the camera.
- **CubeCamera**: Useful for rendering cube maps, often used for environment mapping.

---

## 2. Setting Up a Perspective Camera

### Step 1: Create a Scene

Begin by setting up a basic Three.js scene, renderer, and a perspective camera:

```javascript
const scene = new THREE.Scene();

// Create a perspective camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5); // Position the camera (x, y, z)

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

### Step 2: Adding a 3D Object

Add a simple geometry to the scene so that you can observe the camera's perspective:

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

### Step 3: Render the Scene

Create an animation loop to render the scene from the perspective of the camera:

```javascript
function animate() {
    requestAnimationFrame(animate); // Call animate again for the next frame
    renderer.render(scene, camera); // Render the scene
}

animate(); // Start the animation loop
```

---

## 3. Setting Up an Orthographic Camera

### Step 1: Creating an Orthographic Camera

You can create an orthographic camera by defining the left, right, top, bottom, near, and far clipping planes:

```javascript
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 10; // Size of the viewable area

const orthographicCamera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, // left
    frustumSize * aspect / 2,  // right
    frustumSize / 2,           // top
    frustumSize / -2,          // bottom
    0.1,                       // near
    1000                       // far
);

orthographicCamera.position.set(0, 5, 10); // Position the camera
orthographicCamera.lookAt(0, 0, 0); // Look at the center of the scene
scene.add(orthographicCamera); // Add the camera to the scene
```

### Step 2: Rendering the Scene with the Orthographic Camera

You can render the scene similarly to the perspective camera:

```javascript
function animate() {
    requestAnimationFrame(animate); // Call animate again for the next frame
    renderer.render(scene, orthographicCamera); // Render the scene using the orthographic camera
}

animate(); // Start the animation loop
```

---

## 4. Using Camera Controls

You can use camera controls to enable user interaction, such as panning, zooming, and rotating the camera view.

### Step 1: Import OrbitControls

You can import `OrbitControls` to allow users to control the camera with the mouse:

```html
<script src="https://cdn.rawgit.com/mrdoob/three.js/master/examples/js/controls/OrbitControls.js"></script>
```

### Step 2: Set Up OrbitControls

```javascript
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false; // Pan the camera
controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation
```

### Step 3: Update Controls in the Animation Loop

Ensure to update the controls in your animation loop:

```javascript
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update the controls
    renderer.render(scene, camera);
}

animate(); // Start the animation loop
```

---

## 5. Conclusion

Cameras are essential components in Three.js that define how your 3D scene is viewed. This tutorial covered the basics of setting up both perspective and orthographic cameras, as well as implementing camera controls for enhanced interactivity. With this knowledge, you can create dynamic and engaging 3D applications.

### Further Reading

- [Three.js Camera Documentation](https://threejs.org/docs/index.html#api/en/cameras/Camera)
- [Three.js Examples](https://threejs.org/examples/)
- [Three.js GitHub Repository](https://github.com/mrdoob/three.js)

---

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
