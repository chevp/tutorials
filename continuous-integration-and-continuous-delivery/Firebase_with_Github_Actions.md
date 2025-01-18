
# Deploying an Angular App to Firebase Hosting using GitHub Actions

This tutorial will guide you through the process of setting up **GitHub Actions** to automatically deploy your **Angular app** to **Firebase Hosting** whenever you push changes to your GitHub repository.

---

## Prerequisites

Before you begin, ensure that you have the following:

- A Firebase project set up in the [Firebase Console](https://console.firebase.google.com/).
- Firebase CLI installed on your local machine.
- An Angular app set up and ready for deployment.
- A GitHub repository containing your Angular project.

## Step 1: Set Up Firebase Project and Hosting

### 1.1 Initialize Firebase Hosting

1. **Install Firebase CLI** globally if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. **Log in to Firebase** using the Firebase CLI:
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting** in your Angular project:
   ```bash
   firebase init hosting
   ```
   During initialization, Firebase will ask you:
   - Which Firebase project to associate with.
   - The directory to deploy (choose `dist/your-project-name`).
   - If you'd like to configure single-page app rewrites (yes, choose "yes").

### 1.2 Build Your Angular App

To prepare your app for deployment, run the build command:
```bash
ng build --prod
```
This will generate the production build of your app in the `dist/` directory.

---

## Step 2: Set Up Firebase Authentication for GitHub Actions

You need to authenticate GitHub Actions to access Firebase Hosting. This is done by setting up a **Firebase service account**.

### 2.1 Create a Firebase Service Account

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Project Settings** > **Service Accounts**.
3. Click **Generate New Private Key**. This will download a JSON file containing the credentials.

### 2.2 Add the Service Account Credentials to GitHub Secrets

1. Go to your GitHub repository.
2. Navigate to **Settings** > **Secrets** > **New repository secret**.
3. Add a new secret with the following details:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value**: Paste the entire content of the service account JSON file you just downloaded.

---

## Step 3: Create GitHub Actions Workflow

### 3.1 Set Up the Workflow

Now, you'll set up the GitHub Actions workflow to deploy your Angular app to Firebase Hosting.

1. In your GitHub repository, create a directory `.github/workflows/` if it doesn't already exist.
2. Inside the `workflows` folder, create a new file named `deploy.yml` with the following content:

```yaml
name: Deploy Angular App to Firebase Hosting

on:
  push:
    branches:
      - main  # Trigger deployment on push to the main branch

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # Step 1: Checkout the code
      - name: Checkout code
        uses: actions/checkout@v2

      # Step 2: Set up Node.js and install dependencies
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: |
          npm install

      # Step 3: Build the Angular app
      - name: Build Angular app
        run: |
          ng build --prod

      # Step 4: Deploy to Firebase Hosting
      - name: Deploy to Firebase Hosting
        uses: wzieba/Firebase-Action@v2
        with:
          firebase_service_account: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}
          channel_id: live
```

### 3.2 Workflow Breakdown

- **Trigger**: This workflow triggers when you push changes to the `main` branch.
- **Checkout code**: It checks out your repository to the GitHub runner.
- **Setup Node.js**: It sets up the Node.js environment and installs the necessary dependencies.
- **Build the app**: The Angular app is built using the `ng build --prod` command.
- **Deploy to Firebase Hosting**: The workflow uses the `wzieba/Firebase-Action` action to deploy your app to Firebase Hosting. The service account credentials are accessed from the GitHub secrets.

---

## Step 4: Push Changes and Deploy

Once you’ve set up everything, you can push your changes to the `main` branch of your repository:
```bash
git add .
git commit -m "Set up Firebase Hosting deployment"
git push origin main
```

This will trigger the GitHub Actions workflow and automatically deploy your Angular app to Firebase Hosting.

---

## Conclusion

By following this tutorial, you’ve set up GitHub Actions to automatically deploy your Angular app to Firebase Hosting. Now, every time you push to the `main` branch, the app will be built and deployed to Firebase Hosting without any manual steps.

If you need to make changes to the deployment process, simply update the `deploy.yml` file in your `.github/workflows/` directory.

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
