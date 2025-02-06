
# Firebase Authentication with Firebase Functions: A Complete Guide

## Overview
This tutorial will show you how to integrate Firebase Authentication in your **Angular front-end** and use it to securely interact with **Firebase Functions**. You'll learn how to authenticate users, pass the ID token from your Angular app to your Firebase Functions, and verify it on the backend for secure operations.

---

## Prerequisites
Before starting, make sure you have the following:
- **Firebase Project** set up in the [Firebase Console](https://console.firebase.google.com/).
- **Angular app** with Firebase Authentication already implemented.
- Firebase Functions set up in your project.

---

## Step 1: Set Up Firebase Authentication in Angular Front-End

### Install Firebase SDK
Install Firebase SDK for Angular:

```bash
npm install @angular/fire firebase
```

### Configure Firebase in Angular

In your `src/environments/environment.ts`, add your Firebase project configuration.

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID'
  }
};
```

### Initialize Firebase in `app.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Authentication Logic in Angular

Use Firebase Authentication to authenticate users and get the ID token:

```typescript
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import 'firebase/auth';

constructor(private afAuth: AngularFireAuth) {}

login() {
  this.afAuth.signInWithEmailAndPassword('user@example.com', 'password')
    .then((userCredential) => {
      userCredential.user?.getIdToken()
        .then((idToken) => {
          console.log('ID Token:', idToken);
          // Send this token to your Firebase Functions or other APIs for validation
        });
    })
    .catch((error) => {
      console.error('Error signing in:', error);
    });
}
```

---

## Step 2: Sending ID Token to Firebase Functions

You can send the ID token to Firebase Functions as part of the HTTP request headers:

```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';

constructor(private http: HttpClient) {}

callBackendFunction(idToken: string) {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${idToken}`,
  });

  this.http.post('https://your-cloud-function-url', {}, { headers })
    .subscribe(response => {
      console.log('Backend response:', response);
    });
}
```

---

## Step 3: Verify ID Token in Firebase Functions

In Firebase Functions, verify the ID token to authenticate the user.

### Install Firebase Admin SDK

Run the following command to install the Firebase Admin SDK in your Firebase Functions directory:

```bash
npm install firebase-admin
```

### Function to Verify ID Token

Here’s how you can verify the ID token and use it in Firebase Functions:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const someFunction = functions.https.onRequest(async (req, res) => {
  // Get the ID token from the request headers
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    res.status(401).send('Unauthorized: No token provided');
    return;
  }

  try {
    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Now the user is authenticated, you can proceed with your backend logic
    res.status(200).send(`Hello, user with UID: ${uid}`);
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).send('Unauthorized: Invalid token');
  }
});
```

---

## Step 4: Implement Custom Claims for Role-Based Access (Optional)

You can set **custom claims** to grant users different roles (e.g., admin) and check those roles in Firebase Functions.

### Set Custom Claims

Set custom claims for a user:

```typescript
admin.auth().setCustomUserClaims(uid, { admin: true });
```

### Check Custom Claims in Firebase Functions

In your Firebase Function, check the user’s custom claims:

```typescript
if (decodedToken.admin) {
  // Grant access to admin resources
} else {
  // Deny access or provide limited access
}
```

---

## Step 5: Deploy Firebase Functions

Once your function is ready, deploy it to Firebase:

```bash
firebase deploy --only functions
```

---

## Conclusion

- **Firebase Authentication** handles user login on the front-end (Angular).
- The **ID token** generated by Firebase Authentication is sent to Firebase Functions to verify the user's identity.
- Your **Firebase Functions** can now securely access Firestore, send notifications, or perform other backend operations on behalf of the authenticated user.
- No need for a separate login page for the backend; the authentication is managed in the front-end, and Firebase Functions verify the token.

---

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)

## Content Review

The content in this repository has been reviewed by [chevp](https://github.com/chevp). Chevp is dedicated to ensuring that the information provided is accurate, relevant, and up-to-date, helping users to learn and implement programming skills effectively.

## About the Reviewer

For more insights and contributions, visit chevp's GitHub profile: [chevp's GitHub Profile](https://github.com/chevp).
