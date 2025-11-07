import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "../firebase/serviceAccountKey.json" assert { type: "json" };

// Initialisation Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});

export const db = getFirestore();
export const adminAuth = getAuth();
