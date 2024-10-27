
# Angular with NativeScript Tutorial

NativeScript is a framework for building cross-platform mobile applications using a single codebase. By combining NativeScript with Angular, you can leverage Angular's tools and architecture to build native mobile applications for Android and iOS.

---

## Prerequisites

1. **Node.js and npm**: Ensure Node.js and npm are installed on your system.
   ```bash
   node -v
   npm -v
   ```

2. **NativeScript CLI**: Install the NativeScript CLI globally.
   ```bash
   npm install -g @nativescript/cli
   ```

3. **Android Studio or Xcode**: Install Android Studio for Android development or Xcode for iOS development.

---

## 1. Setting Up a New NativeScript + Angular Project

### Step 1: Create a New Project

Run the following command to create a new NativeScript project with Angular:

```bash
ns create my-app --template @nativescript/template-blank-ng
```

Follow the prompts to configure your project settings.

### Step 2: Navigate into the Project Directory

```bash
cd my-app
```

### Step 3: Run the Project

To start the application on an Android or iOS emulator:

```bash
ns run android
# or
ns run ios
```

This will build and launch the application on the emulator or connected device.

---

## 2. Understanding Project Structure

The NativeScript + Angular project structure includes the following key folders and files:

- **`app`**: Contains your application’s core files.
  - **`app.module.ts`**: Defines the root module for the app.
  - **`app.component.ts`**: The main component where you set up the app's layout and primary logic.
  - **`main.ts`**: Bootstraps the Angular application.

- **`package.json`**: Lists project dependencies, including NativeScript and Angular packages.

---

## 3. Creating a Simple NativeScript Angular Component

### Step 1: Update `app.component.ts`

Open `app/app.component.ts` and modify it as follows:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'ns-app',
  templateUrl: './app.component.html',
})
export class AppComponent {
  message: string = 'Hello, NativeScript with Angular!';

  changeMessage() {
    this.message = 'Message changed!';
  }
}
```

### Step 2: Update `app.component.html`

In `app/app.component.html`, add a button and display the message:

```html
<StackLayout>
  <Label [text]="message" class="h1 text-center m-20"></Label>
  <Button text="Change Message" (tap)="changeMessage()" class="btn btn-primary"></Button>
</StackLayout>
```

- **`Label`**: Displays the message.
- **`Button`**: Calls `changeMessage` to update the message text when tapped.

---

## 4. Styling the App

NativeScript uses CSS for styling. Open `app/app.css` and add some styles:

```css
Label {
  color: #333;
  font-size: 20;
}

Button {
  margin: 20;
  padding: 10;
  color: white;
  background-color: #3b82f6;
}
```

---

## 5. Adding Navigation with Angular Routing

You can add routing to navigate between pages.

### Step 1: Generate a New Component

Use the NativeScript CLI to generate a new component:

```bash
ns generate component about
```

This creates a new `about` component.

### Step 2: Set Up Routes

In `app/app-routing.module.ts`, configure routes for the application:

```typescript
import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';

import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'about', component: AboutComponent },
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
```

### Step 3: Add Navigation to `app.component.html`

Add a button to navigate to the new `About` page:

```html
<StackLayout>
  <Label [text]="message" class="h1 text-center m-20"></Label>
  <Button text="Change Message" (tap)="changeMessage()" class="btn btn-primary"></Button>
  <Button text="Go to About Page" [nsRouterLink]="['/about']" class="btn btn-secondary mt-20"></Button>
</StackLayout>
```

---

## 6. Running the App

To start the app on an Android or iOS emulator:

```bash
ns run android
# or
ns run ios
```

This will launch the app on the selected emulator or device. You can interact with the app by changing the message and navigating to the About page.

---

## Summary

This tutorial introduced the basics of building a NativeScript + Angular app:

1. Setting up the NativeScript environment with Angular.
2. Creating components and setting up event handling.
3. Adding routing and navigation.

NativeScript allows you to build powerful, cross-platform mobile applications using Angular's architecture and tools. Experiment with additional NativeScript UI components and services to enhance your app.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
