import { FirebaseApp, initializeApp } from "firebase/app";
import { Messaging, getMessaging } from "firebase/messaging";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}
//test
// const firebaseConfig: FirebaseConfig = {
//   apiKey: "AIzaSyDBVx5SSG00FnQdPObemy1lqvwlYEU_cK4",
//   authDomain: "test-manage-app.firebaseapp.com",
//   projectId: "test-manage-app",
//   storageBucket: "test-manage-app.firebasestorage.app",
//   messagingSenderId: "981875567127",
//   appId: "1:981875567127:web:5a3e53e90c95de8da8ca52",
//   measurementId: "G-2NP1QM5GLS",
// };

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyAZ66UkWykI_qEvv-Gw5o0JfB_4jR15Cdg",

  authDomain: "order-buddy-f2fe2.firebaseapp.com",

  projectId: "order-buddy-f2fe2",

  storageBucket: "order-buddy-f2fe2.firebasestorage.app",

  messagingSenderId: "541162236361",

  appId: "1:541162236361:web:d065878f2f8f108484a018",

  measurementId: "G-J5QHTRTFG5",
};

// const firebaseConfig: FirebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
//   appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
// }

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Messaging service
export const messaging: Messaging = getMessaging(app);
export default app;
