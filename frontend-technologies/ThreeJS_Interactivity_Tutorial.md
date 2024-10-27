
# Three.js Interactivity Tutorial

Interactivity is a key aspect of creating engaging 3D experiences in Three.js. This tutorial will guide you through the process of adding interactive features to your 3D scenes, including mouse and keyboard events, raycasting, and user interface elements.

---

## 1. Introduction to Interactivity

Three.js allows you to respond to user input, enabling you to create dynamic and interactive 3D applications. You can handle various events, such as mouse clicks, keyboard inputs, and touch gestures.

### Key Concepts

- **Raycasting**: A technique used to detect intersections between a ray and objects in the scene, enabling interactivity.
- **Event Listeners**: Functions that respond to user input events.

---

## 2. Setting Up the Scene

### Step 1: Create a Basic Scene

Begin by setting up a simple Three.js scene:

```javascript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

---

## 3. Adding Mouse Interactivity

### Step 1: Raycasting Setup

To enable mouse interactions, you will need to create a raycaster and a mouse vector:

```javascript
const raycaster = new THREE.Raycaster(); // Create a raycaster
const mouse = new THREE.Vector2(); // Create a mouse vector
```

### Step 2: Add Mouse Move Event Listener

Listen for mouse movement and update the mouse vector accordingly:

```javascript
window.addEventListener('mousemove', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; 
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; 
});
```

### Step 3: Check for Intersections

Inside the animation loop, use the raycaster to check for intersections between the ray and objects in the scene:

```javascript
function animate() {
    requestAnimationFrame(animate);

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        // Change color of the intersected object
        intersects[0].object.material.color.set(0xff0000); // Change to red
    } else {
        cube.material.color.set(0x00ff00); // Reset color if not intersected
    }

    renderer.render(scene, camera); // Render the scene
}

animate(); // Start the animation loop
```

---

## 4. Keyboard Interactivity

### Step 1: Add Keyboard Event Listener

Listen for keyboard events to trigger actions in your scene:

```javascript
window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            cube.position.y += 0.1; // Move cube up
            break;
        case 'ArrowDown':
            cube.position.y -= 0.1; // Move cube down
            break;
        case 'ArrowLeft':
            cube.position.x -= 0.1; // Move cube left
            break;
        case 'ArrowRight':
            cube.position.x += 0.1; // Move cube right
            break;
    }
});
```

---

## 5. Adding a User Interface

### Step 1: Create HTML Elements

You can enhance interactivity by adding HTML elements like buttons to your scene.

```html
<button id="resetButton" style="position: absolute; top: 10px; left: 10px;">Reset Cube</button>
```

### Step 2: Add Event Listener for the Button

Listen for button clicks and perform actions accordingly:

```javascript
document.getElementById('resetButton').addEventListener('click', () => {
    cube.position.set(0, 0, 0); // Reset cube position
});
```

---

## 6. Conclusion

In this tutorial, you learned how to add interactivity to your Three.js scenes using mouse events, keyboard inputs, raycasting, and HTML user interface elements. With these techniques, you can create dynamic and engaging 3D experiences.

### Further Reading

- [Three.js Raycasting Documentation](https://threejs.org/docs/index.html#api/en/core/Raycaster)
- [Three.js Events Documentation](https://threejs.org/docs/index.html#manual/en/introduction/Events)
- [Three.js Examples](https://threejs.org/examples/)
- [Three.js GitHub Repository](https://github.com/mrdoob/three.js)

---

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
