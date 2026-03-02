import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDuDIcxPh5vPij8afyUPXCDxRJtF-igB1g",
    authDomain: "student-accerator.firebaseapp.com",
    projectId: "student-accerator",
    storageBucket: "student-accerator.firebasestorage.app",
    messagingSenderId: "1091377115228",
    appId: "1:1091377115228:web:d57b811a96ddf3bf2b7699",
    measurementId: "G-H078JEWZF7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Add scopes for Google Sign-In
googleProvider.addScope('email');
googleProvider.addScope('profile');
