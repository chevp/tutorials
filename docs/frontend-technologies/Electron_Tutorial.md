
# Electron Tutorial

Electron is a popular open-source framework for building cross-platform desktop applications with web technologies like HTML, CSS, and JavaScript. It combines the Chromium rendering engine and the Node.js runtime, allowing developers to create native desktop applications using familiar web tools.

---

## Prerequisites

1. **Node.js**: Ensure Node.js is installed on your system.
    ```bash
    node -v
    ```

2. **npm**: npm is typically installed with Node.js. Verify installation:
    ```bash
    npm -v
    ```

---

## 1. Setting Up an Electron Project

### Step 1: Create a New Project Directory

Create a directory for your Electron application and navigate to it:
```bash
mkdir my-electron-app
cd my-electron-app
```

### Step 2: Initialize npm

Initialize a new npm project in your directory:
```bash
npm init -y
```

### Step 3: Install Electron

Install Electron as a development dependency:
```bash
npm install electron --save-dev
```

---

## 2. Creating the Electron Application

### Step 1: Create Main Files

Create the following files in your project directory:
- `main.js`: Main script for running Electron.
- `index.html`: A simple HTML file for the application UI.

### Step 2: Write Code for `main.js`

The `main.js` file controls the main process in Electron. Add the following code to `main.js`:

```javascript
const { app, BrowserWindow } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

### Step 3: Create a Simple UI in `index.html`

Add the following basic HTML to `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Electron App</title>
</head>
<body>
    <h1>Hello, Electron!</h1>
    <p>This is a simple Electron app.</p>
</body>
</html>
```

---

## 3. Configuring the `package.json`

Add a `start` script to run Electron in your `package.json` file:

```json
"scripts": {
    "start": "electron ."
}
```

Now, you can start your Electron application with:
```bash
npm start
```

---

## 4. Packaging the Application

Electron provides several tools for packaging an app for distribution. One of the popular tools is **Electron Packager**.

### Installing Electron Packager

Install Electron Packager as a dev dependency:
```bash
npm install electron-packager --save-dev
```

### Packaging the Application

Run the following command to package your app:

```bash
npx electron-packager . MyElectronApp --platform=win32 --arch=x64 --out=dist
```

**Options**:
- `--platform`: Specifies the target platform (e.g., `win32`, `darwin`, `linux`).
- `--arch`: Specifies the architecture (e.g., `x64`, `arm64`).
- `--out`: Specifies the output directory.

---

## 5. Adding Features to Your Electron App

Electron provides modules like `ipcMain` and `ipcRenderer` for communication between the main and renderer processes.

### Example: Adding Communication Between Processes

Update `main.js` to handle an IPC event:

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.loadFile('index.html');

    ipcMain.on('ping', (event) => {
        event.reply('pong', 'Hello from Main Process');
    });
}

app.whenReady().then(createWindow);
```

In `index.html`, add a script to send an IPC message:

```html
<script>
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('ping');
    ipcRenderer.on('pong', (event, message) => {
        console.log(message);
    });
</script>
```

---

## Summary

This tutorial introduced the basics of setting up an Electron project and building a simple application. You learned to:

1. Set up a new Electron project and add essential files.
2. Configure Electron to open a window displaying a webpage.
3. Implement basic inter-process communication (IPC) in Electron.

Electron enables developers to create cross-platform desktop applications with ease. Experiment with Electron modules to add functionality like menus, dialogs, and notifications.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
