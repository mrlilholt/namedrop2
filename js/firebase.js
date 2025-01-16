// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import { getFirestore, collection, doc, getDocs, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDiHaU6ajRkeo-YFiErXsZ7pu3LuvtBGZ0",
    authDomain: "namedrop-16d4b.firebaseapp.com",
    projectId: "namedrop-16d4b",
    storageBucket: "namedrop-16d4b.appspot.com",
    messagingSenderId: "373402334408",
    appId: "1:373402334408:web:1f1c36d48863eed50f21fd",
    measurementId: "G-5DN86C549G",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Export everything needed
export { auth, provider, signInWithPopup, db, collection, doc, getDocs, setDoc, getDoc };
