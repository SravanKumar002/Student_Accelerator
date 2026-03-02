import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// For production, you should use a service account key file
// For now, we'll initialize with project ID only (works with emulator or default credentials)

let firebaseAdmin;

try {
    // Check if already initialized
    firebaseAdmin = admin.app();
} catch (error) {
    // Initialize Firebase Admin
    firebaseAdmin = admin.initializeApp({
        projectId: "student-accerator",
    });
}

export const adminAuth = admin.auth();
export default firebaseAdmin;
