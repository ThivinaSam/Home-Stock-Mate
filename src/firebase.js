// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBQBtuzttFRUWIrotwMhd1OQ9ctq25Nm54",
  authDomain: "homestockmate.firebaseapp.com",
  projectId: "homestockmate",
  storageBucket: "homestockmate.firebasestorage.app",
  messagingSenderId: "888668578086",
  appId: "1:888668578086:web:d63efda45e821a091761e7",
  measurementId: "G-1HFKMSQ3JG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);


