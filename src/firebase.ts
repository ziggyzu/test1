import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3JDXIGhnrINEG4Znr3v3J-qDEcYBhZa4",
  authDomain: "class-companion-967a3.firebaseapp.com",
  projectId: "class-companion-967a3",
  storageBucket: "class-companion-967a3.firebasestorage.app",
  messagingSenderId: "171789075516",
  appId: "1:171789075516:web:ab0e51d662d1e7a83caf39",
  measurementId: "G-TQV07PYWDN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
