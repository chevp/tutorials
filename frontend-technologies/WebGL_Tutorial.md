
# WebGL Tutorial

WebGL (Web Graphics Library) is a JavaScript API for rendering 2D and 3D graphics in a web browser, without plugins. WebGL is based on OpenGL ES, allowing for GPU-accelerated rendering, and is widely supported in modern web browsers.

---

## Prerequisites

1. **Basic Knowledge of JavaScript and HTML**: Familiarity with JavaScript and HTML is recommended.
2. **A Code Editor**: Use any text editor like VS Code, Sublime Text, or Atom.

---

## 1. Setting Up the HTML File

Create an `index.html` file to hold your WebGL setup:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGL Tutorial</title>
</head>
<body>
    <canvas id="glcanvas" width="640" height="480"></canvas>
    <script src="app.js"></script>
</body>
</html>
```

This HTML file includes a `<canvas>` element, which WebGL uses as a rendering surface.

---

## 2. Setting Up the WebGL Context

Create a file named `app.js` and add the following code to set up a WebGL rendering context:

```javascript
const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error("WebGL not supported. Falling back on experimental-webgl.");
    gl = canvas.getContext('experimental-webgl');
}

if (!gl) {
    alert("Your browser does not support WebGL.");
}
```

This code initializes WebGL. If WebGL is not supported, it tries `experimental-webgl` as a fallback.

---

## 3. Setting Up Shaders

WebGL requires shaders for rendering. Shaders are small programs that run on the GPU to control the rendering process.

### Step 1: Vertex Shader

Add the following code to create a basic vertex shader:

```javascript
const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    void main() {
        gl_Position = aVertexPosition;
    }
`;
```

### Step 2: Fragment Shader

The fragment shader determines the color of each pixel. Add this code for a simple red color:

```javascript
const fragmentShaderSource = `
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // Red color
    }
`;
```

---

## 4. Compiling the Shaders

Create a function to compile the shaders:

```javascript
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
```

Use this function to compile the vertex and fragment shaders:

```javascript
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
```

---

## 5. Creating a Shader Program

Combine the vertex and fragment shaders into a shader program:

```javascript
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

const shaderProgram = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(shaderProgram);
```

---

## 6. Defining a Triangle

Define the geometry (a triangle) to be drawn:

```javascript
const vertices = new Float32Array([
    0.0,  1.0,  // Vertex 1 (X, Y)
   -1.0, -1.0,  // Vertex 2 (X, Y)
    1.0, -1.0   // Vertex 3 (X, Y)
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
```

---

## 7. Rendering the Scene

Now that everything is set up, draw the triangle to the screen:

```javascript
function drawScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

drawScene();
```

This `drawScene` function clears the canvas to black and draws the triangle in red.

---

## Summary

This tutorial introduced the basics of using WebGL to create a 3D rendering context and display a simple triangle:

1. Setting up the WebGL context.
2. Creating vertex and fragment shaders.
3. Compiling and linking shaders into a program.
4. Defining geometry and drawing it.

WebGL provides low-level access to the GPU, allowing for efficient rendering of 2D and 3D graphics. Experiment with shaders and geometry to create more complex scenes.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
