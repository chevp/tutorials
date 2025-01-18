
# How to Deploy an Angular App to Firebase Hosting

This tutorial walks you through the steps of deploying an Angular app to Firebase Hosting.

## Prerequisites
Before starting, ensure that you have the following:

- [Node.js](https://nodejs.org/) installed on your machine.
- [Angular CLI](https://angular.io/cli) installed globally (`npm install -g @angular/cli`).
- [Firebase CLI](https://firebase.google.com/docs/cli) installed globally (`npm install -g firebase-tools`).
- A Firebase account and a Firebase project created in the [Firebase Console](https://console.firebase.google.com/).

## Step 1: Install Firebase CLI
If you haven't already installed Firebase CLI globally, run the following command:

```bash
npm install -g firebase-tools
```

## Step 2: Build Your Angular App for Production
In your Angular project directory, build your app for production:

```bash
ng build --prod
```

This will create a `dist/` directory inside your project with your production-ready files. The output will be placed in `dist/<your-app-name>/`.

## Step 3: Initialize Firebase in Your Project
1. Navigate to your Angular project directory:

   ```bash
   cd <your-angular-project>
   ```

2. Initialize Firebase in the project by running:

   ```bash
   firebase init
   ```

   - Select **Hosting** (you may also choose other Firebase features, such as Firestore or Functions, but for this, we’re focusing on Hosting).
   - Choose the Firebase project you want to associate with your Angular app.
   - Set the public directory to `dist/<your-app-name>` (the folder that was generated in the previous step).
   - Configure Firebase Hosting as a **single-page app** by answering `Yes` when prompted to rewrite all URLs to `index.html`.

## Step 4: Deploy Your Angular App to Firebase Hosting
After setting up Firebase Hosting, deploy your Angular app by running:

```bash
firebase deploy
```

Firebase will upload your `dist/<your-app-name>` folder and deploy it to Firebase Hosting. Once deployment is complete, you will see a URL in the output like:

```
Hosting URL: https://<your-app-name>.web.app
```

## Step 5: Verify the Deployment
Once the deployment is complete, visit the URL provided (`https://<your-app-name>.web.app`) to access your live Angular app.

## Optional Step: Modify `firebase.json` Configuration
Your `firebase.json` file will be automatically generated when you initialize Firebase Hosting. It should look something like this:

```json
{
  "hosting": {
    "public": "dist/<your-app-name>",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

This configuration ensures that all routes in your Angular app (especially if you're using Angular routing) are handled by redirecting them to `index.html`, allowing Angular to manage routing on the client side.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
