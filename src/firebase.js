// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2kJXIPK0qtSXm8lY66U244S0FOZkGcrw",
  authDomain: "rosterly-68dbe.firebaseapp.com",
  projectId: "rosterly-68dbe",
  storageBucket: "rosterly-68dbe.firebasestorage.app",
  messagingSenderId: "1045097363737",
  appId: "1:1045097363737:web:038d6258331ca7401cad88",
  measurementId: "G-KY08R6XNV5"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);