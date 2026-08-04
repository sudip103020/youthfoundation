import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDNH-kgYOBWIX6wuACRyOc4UAc0HhGj3Cg",
  authDomain: "badokhali-youth-foundation.firebaseapp.com",
  projectId: "badokhali-youth-foundation",
  storageBucket: "badokhali-youth-foundation.firebasestorage.app",
  messagingSenderId: "593063511104",
  appId: "1:593063511104:web:6754637a246844fd968ba5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;