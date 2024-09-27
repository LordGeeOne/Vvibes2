import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyCwrvL7_0jb9rLzWEgG6xPT49IjtqeUa6Y",
  authDomain: "studentvibesv2.firebaseapp.com",
  projectId: "studentvibesv2",
  storageBucket: "studentvibesv2.appspot.com",
  messagingSenderId: "248149617317",
  appId: "1:248149617317:web:acd348fbb25203173cfb4c",
  measurementId: "G-8W1JCE37HZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export Firebase Storage