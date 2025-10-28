// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSm03ytoqWx9yNxL-KF3he0dDzFC8DdzU",
  authDomain: "swiftbites-23d4b.firebaseapp.com",
  databaseURL: "https://swiftbites-23d4b-default-rtdb.firebaseio.com",
  projectId: "swiftbites-23d4b",
  storageBucket: "swiftbites-23d4b.firebasestorage.app",
  messagingSenderId: "549713410717",
  appId: "1:549713410717:web:5f12751c5d1c09f64e3274",
  measurementId: "G-BX0VPYS7Z0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);


export { app, analytics, db, auth };