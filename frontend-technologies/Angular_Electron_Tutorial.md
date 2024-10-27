
# Embedding an Angular WebApp into Electron Tutorial

Electron is a framework that allows you to create cross-platform desktop applications using web technologies. By embedding an Angular application in Electron, you can package your web app as a native desktop app for Windows, macOS, and Linux.

---

## Prerequisites

1. **Node.js and npm**: Ensure Node.js and npm are installed on your system.
   ```bash
   node -v
   npm -v
   ```
2. **Angular CLI**: Install the Angular CLI if you haven't already.
   ```bash
   npm install -g @angular/cli
   ```
3. **Electron**: Electron will be installed as part of this tutorial.

---

## 1. Setting Up an Angular Project

If you don’t already have an Angular project, create a new one:

```bash
ng new my-angular-app
cd my-angular-app
```

Follow the prompts to configure your project.

## 2. Installing Electron

Install Electron as a development dependency:

```bash
npm install electron --save-dev
```

## 3. Configuring Electron for Angular

Create a new `main.js` file in the root of your Angular project. This file will act as the entry point for Electron.

### `main.js`

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win.loadFile(path.join(__dirname, 'dist/my-angular-app/index.html')); // Adjust path if your Angular app name differs
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
```

### Explanation

- **BrowserWindow**: Creates the main application window.
- **webPreferences**: Enables `nodeIntegration` and disables `contextIsolation` to allow Electron to communicate with Angular.

---

## 4. Adding a Build Script for Electron

Update `package.json` to include Electron commands:

```json
"scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "electron:start": "ng build && electron .",
    "electron:build": "ng build --prod && electron ."
}
```

### Script Explanation

- **electron:start**: Builds the Angular app and then starts Electron.
- **electron:build**: Builds a production version of the Angular app and starts Electron.

---

## 5. Configuring the Angular Build

Open `angular.json` and modify the `"outputPath"` for your build configuration to ensure the build files are output to a location Electron can access:

```json
"outputPath": "dist/my-angular-app"
```

Ensure this path matches the one used in `main.js`.

---

## 6. Running the App with Electron

To test the app in Electron, use the following command:

```bash
npm run electron:start
```

This builds the Angular application and opens it within an Electron window.

---

## 7. Packaging the Application

To distribute your app as a standalone executable, use **Electron Packager**.

### Step 1: Install Electron Packager

```bash
npm install electron-packager --save-dev
```

### Step 2: Create a Packaging Script

Add a packaging script in `package.json`:

```json
"scripts": {
    "package": "electron-packager . MyAngularApp --platform=win32 --arch=x64 --out=release --overwrite"
}
```

Replace `win32` with `darwin` for macOS or `linux` for Linux. Run the packaging command:

```bash
npm run package
```

---

## Summary

This tutorial covered the basics of embedding an Angular web app into Electron:

1. Setting up an Angular application for Electron.
2. Creating Electron configuration files.
3. Running and packaging the app for distribution.

Embedding Angular in Electron provides a powerful solution for cross-platform desktop apps built with modern web technologies.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
