import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import axiosInstance from '../contexts/axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Verifica si un email de Google ya está registrado en el sistema
 * @param {string} email - Email a verificar
 * @returns {Promise} - { exists: boolean, user?: object }
 */
export const checkGoogleAccountExists = async (email) => {
    try {
        console.log('🔍 Verificando si la cuenta existe:', email);
        
        const response = await axiosInstance.post(
            `/auth/check-google-account`,
            { email }
        );

        console.log('📥 Respuesta de verificación:', response.data);
        
        return {
            exists: response.data.exists,
            user: response.data.user || null,
            requiresRoleSelection: response.data.requiresRoleSelection || false
        };
} catch (error) {
        console.error('❌ Error al verificar cuenta:', error);
        // Lanzar el error para que el frontend pueda manejarlo
        throw error;
    }
};

/**
 * Autentica con Google usando Firebase y obtiene JWT del backend
 * @param {number} rolId - 1 para usuario estudiante, 2 para arrendador
 * @returns {Promise} - Datos del usuario con JWT
 */
export const firebaseGoogleSignIn = async (rolId) => {
    try {
        console.log('🚀 Iniciando Firebase Google Sign-In...');
        
        // 1. Sign in con Google usando Firebase
        console.log('📱 Abriendo diálogo de Google...');
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        console.log('✅ Google Sign-In exitoso:', user.email);

        // 2. Obtener ID token de Firebase (JWT que Firebase genera)
        console.log('🔑 Obteniendo Firebase ID Token...');
        const firebaseToken = await user.getIdToken();
        
        console.log('📤 Enviando token al backend para intercambio...');
        console.log('🔗 URL:', `${API_URL}/auth/firebase-login`);

        // 3. Enviar Firebase token al backend para intercambiarlo por JWT de app
        const response = await axiosInstance.post(
            `/auth/firebase-login`,
            {
                firebaseToken,
                rolId,
                email: user.email,
                nombre: user.displayName?.split(' ')[0] || user.email,
                apellido: user.displayName?.split(' ').slice(1).join(' ') || '',
                photoURL: user.photoURL || null,
            }
        );

console.log('📥 Respuesta del backend recibida:', response.data);

        if (response.data.success) {
            console.log('✅ Autenticación completada exitosamente');
            return {
                success: true,
                user: response.data.user,
                token: response.data.token,
                requiresRoleSelection: response.data.requiresRoleSelection || false,
            };
        } else {
            throw new Error(response.data.message || 'Error al autenticar');
        }
    } catch (error) {
        console.error('❌ Error en Firebase Google Sign-In:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            details: error.response?.data?.details
        });
        
        // Proporcionar mensajes más legibles
        let userMessage = 'Error al autenticar con Google';
        
        if (error.response?.status === 401) {
            userMessage = 'Token de Firebase inválido o expirado. Intenta de nuevo.';
        } else if (error.response?.status === 400) {
            userMessage = 'Parámetros de autenticación incorrrectos.';
        } else if (error.code === 'auth/popup-closed-by-user') {
            userMessage = 'Cerraste el diálogo de Google.';
        } else if (error.code === 'auth/popup-blocked') {
            userMessage = 'El navegador bloqueó el diálogo de Google.';
        }
        
        throw new Error(userMessage);
    }
};

/**
 * Cierra sesión de Firebase
 */
export const firebaseSignOut = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Error cerrando sesión de Firebase:', error);
        throw error;
    }
};

/**
 * Obtiene el usuario actual autenticado en Firebase
 */
export const getCurrentFirebaseUser = () => {
    return auth.currentUser;
};
