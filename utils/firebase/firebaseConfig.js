import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyA48zjucQGduJ3KawkUMtSXVbiYCvgb4No",
    authDomain: "mapgame3d.firebaseapp.com",
    projectId: "mapgame3d",
    storageBucket: "mapgame3d.appspot.com",
    messagingSenderId: "332729178709",
    appId: "1:332729178709:web:8876274354e979d6a252dc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Add this line to get the Firestore database

export { auth, db }; // Export both auth and db