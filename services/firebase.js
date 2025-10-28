"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = exports.analytics = exports.app = void 0;
// Import the functions you need from the SDKs you need
var app_1 = require("firebase/app");
var analytics_1 = require("firebase/analytics");
var database_1 = require("firebase/database");
var auth_1 = require("firebase/auth");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
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
var app = (0, app_1.initializeApp)(firebaseConfig);
exports.app = app;
var analytics = (0, analytics_1.getAnalytics)(app);
exports.analytics = analytics;
var db = (0, database_1.getDatabase)(app);
exports.db = db;
var auth = (0, auth_1.getAuth)(app);
exports.auth = auth;
