
# Three.js Lighting Tutorial

Lighting is a crucial aspect of 3D rendering that affects how objects are displayed in a scene. Three.js offers a variety of light types to simulate different lighting effects. This tutorial will guide you through the different types of lighting available in Three.js and how to implement them in your 3D scenes.

---

## 1. Introduction to Lighting

In Three.js, lighting is used to illuminate 3D objects, giving them depth and realism. The choice of light type and how it is configured can significantly impact the visual quality of your scene.

### Types of Lights

- **AmbientLight**: Provides a uniform light that affects all objects equally, without casting shadows.
- **DirectionalLight**: Simulates sunlight or similar light sources, casting parallel light rays and shadows.
- **PointLight**: Emits light in all directions from a single point, similar to a light bulb.
- **SpotLight**: Emits light in a specific direction with a cone shape, capable of casting shadows.
- **HemisphereLight**: A gradient light that simulates light coming from the sky, providing subtle illumination.

---

## 2. Setting Up Basic Lighting

### Step 1: Create a Scene

Begin by setting up a basic Three.js scene, camera, and renderer:

```javascript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

### Step 2: Adding Ambient Light

Add ambient light to the scene to provide general illumination:

```javascript
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);
```

### Step 3: Adding a Directional Light

Add a directional light that casts shadows:

```javascript
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light with full intensity
directionalLight.position.set(5, 5, 5); // Set light position
scene.add(directionalLight);
```

---

## 3. Adding Shadows

To enable shadows in your scene, you need to configure both the light source and the objects that will cast and receive shadows.

### Step 1: Enable Shadows on the Renderer

```javascript
renderer.shadowMap.enabled = true; // Enable shadow maps
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Choose shadow map type
```

### Step 2: Configure the Light to Cast Shadows

```javascript
directionalLight.castShadow = true; // Enable shadow casting for the directional light
```

### Step 3: Configure Objects to Cast and Receive Shadows

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true; // Cube will cast shadows
scene.add(cube);

const planeGeometry = new THREE.PlaneGeometry(5, 5);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2; // Rotate to make it horizontal
plane.position.y = -1; // Position below the cube
plane.receiveShadow = true; // Plane will receive shadows
scene.add(plane);
```

---

## 4. Using Point Lights

Point lights can also be added to your scene. They emit light in all directions.

### Step 1: Creating a Point Light

```javascript
const pointLight = new THREE.PointLight(0xff0000, 1, 100); // Red light
pointLight.position.set(0, 5, 0); // Position above the scene
scene.add(pointLight);
```

### Step 2: Adding a Helper for Visualization

Use a helper to visualize the point light in the scene:

```javascript
const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
scene.add(pointLightHelper);
```

---

## 5. Using Spot Lights

Spotlights can focus light in a specific direction with a cone shape.

### Step 1: Creating a Spotlight

```javascript
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(-5, 5, 5); // Position in the scene
spotLight.castShadow = true; // Enable shadow casting
scene.add(spotLight);
```

### Step 2: Configuring the Spotlight

You can configure the spotlight's angle and distance:

```javascript
spotLight.angle = Math.PI / 6; // Angle of the spotlight cone
spotLight.penumbra = 0.1; // Softness of the edge of the cone
spotLight.distance = 100; // Max distance the light will reach
```

---

## 6. Conclusion

Lighting is essential for achieving realistic and visually appealing scenes in Three.js. This tutorial covered the basics of different light types, how to add them to a scene, and how to configure shadows. With these techniques, you can enhance the depth and realism of your 3D applications.

### Further Reading

- [Three.js Lighting Documentation](https://threejs.org/docs/index.html#manual/en/introduction/Lighting)
- [Three.js Examples](https://threejs.org/examples/)
- [Three.js GitHub Repository](https://github.com/mrdoob/three.js)

---

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
