import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Configuración de Firebase (obtén estos valores del Firebase Console)
// https://console.firebase.google.com/
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener Auth y configurar Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configurar comportamiento de Google Sign-In
googleProvider.setCustomParameters({
    prompt: 'select_account', // Mostrar selector de cuenta
});

export default app;
