import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDM4sPgzRjDJ7S9Pms2Bbq1cnZ7vHTwiQk",
    authDomain: "chhattishgarh-shaadi.firebaseapp.com",
    projectId: "chhattishgarh-shaadi",
    storageBucket: "chhattishgarh-shaadi.firebasestorage.app",
    messagingSenderId: "114963250437",
    appId: "1:114963250437:web:c6a04efcbf44c4c22c54b6", // Guessed from android ID but need real web ID if possible. Using placeholder if not works.
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;
