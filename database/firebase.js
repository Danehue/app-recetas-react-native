// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJrV8FhD-uPF1J_NwWLf5w2LUPqM3OrmY",
  authDomain: "app-recetas-70d12.firebaseapp.com",
  projectId: "app-recetas-70d12",
  storageBucket: "app-recetas-70d12.appspot.com",
  messagingSenderId: "846168139783",
  appId: "1:846168139783:web:75389b433439e888a722a2",
  measurementId: "G-EWPHHFSDR8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export default { app };