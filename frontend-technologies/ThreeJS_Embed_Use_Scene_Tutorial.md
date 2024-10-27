
# Embedding the Three.js Editor and Using a Created Scene

This tutorial will guide you on how to embed the Three.js Editor into your web application and how to use a scene created in the editor in your own Three.js project.

---

## 1. Embedding the Three.js Editor

To embed the Three.js Editor, you can use an HTML `<iframe>`. This allows users to interact with the editor directly from your webpage.

### Step 1: Create an HTML Page

Create a basic HTML file to host your Three.js Editor.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Three.js Editor</title>
    <style>
        body { margin: 0; }
        iframe { width: 100%; height: 600px; border: none; }
    </style>
</head>
<body>
    <iframe src="https://threejs.org/editor/"></iframe>
</body>
</html>
```

### Step 2: Save and Open Your HTML File

Save your HTML file and open it in a web browser. You will see the Three.js Editor embedded in your page.

---

## 2. Using a Created Scene

Once you have created a scene in the Three.js Editor, you can export it and use it in your own Three.js project.

### Step 1: Export the Scene

1. Open the Three.js Editor.
2. Create your 3D scene using the editor.
3. Click on the **File** menu in the top left corner.
4. Select **Export** and then choose **Export Scene** to save the scene as a `.json` file.

### Step 2: Load the Scene in Your Project

To load the exported scene into your Three.js project, use the `THREE.ObjectLoader`. Here’s how you can do it:

```javascript
// Create a scene and a camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load the exported scene
const loader = new THREE.ObjectLoader();
loader.load('path/to/your/exported_scene.json', (loadedScene) => {
    scene.add(loadedScene); // Add the loaded scene to the current scene
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
```

### Step 3: Ensure File Accessibility

- **Hosting the JSON File**: Make sure that your JSON file is hosted on a server and is accessible from the location where your HTML file is served.
- **Running Locally**: If you are running this locally, you may need to set up a local server (like using Live Server in VSCode) to serve the file correctly.

---

## 3. Conclusion

By following this tutorial, you have learned how to embed the Three.js Editor into your own web application and how to export and use a scene created in the editor in your Three.js projects.

### Further Reading

- [Three.js Editor Documentation](https://threejs.org/editor/)
- [Three.js Documentation](https://threejs.org/docs/index.html)
- [Three.js Examples](https://threejs.org/examples/)

---

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
