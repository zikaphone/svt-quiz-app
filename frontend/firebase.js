import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD8KP2cOGob0JQ-ohLKx5BLF3sqF57k0X0",
    authDomain: "quizzermen.firebaseapp.com",
    projectId: "quizzermen",
    storageBucket: "quizzermen.firebasestorage.app",
    messagingSenderId: "548869427848",
    appId: "1:548869427848:web:2581d67452c5435a5e453d"
  
  };
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
