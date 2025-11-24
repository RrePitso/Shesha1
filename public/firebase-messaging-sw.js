
// Imports the Firebase app and messaging scripts.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initializes the Firebase app with your project's configuration.
firebase.initializeApp({
    apiKey: "AIzaSyBSm03ytoqWx9yNxL-KF3he0dDzFC8DdzU",
    authDomain: "swiftbites-23d4b.firebaseapp.com",
    databaseURL: "https://swiftbites-23d4b-default-rtdb.firebaseio.com",
    projectId: "swiftbites-23d4b",
    storageBucket: "swiftbites-23d4b.appspot.com",
    messagingSenderId: "549713410717",
    appId: "1:549713410717:web:5f12751c5d1c09f64e3274",
    measurementId: "G-BX0VPYS7Z0"
});

// Gets the messaging instance.
const messaging = firebase.messaging();

console.log("Firebase messaging service worker is set up");
