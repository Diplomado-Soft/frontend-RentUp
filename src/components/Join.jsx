import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUserPlus, faSignInAlt, faBuilding, faHome, faShieldHeart, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

function Join({ onClose }) {
const navigate = useNavigate();

const goToSignup = () => {
    navigate('/role-selection');
    onClose();
};

const goToLogin = () => {
    navigate('/login');
    onClose();
};

return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface-900/60 backdrop-blur-md z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative transform animate-scale-in border border-surface-100 overflow-hidden">
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary-100 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent-100 rounded-full translate-x-12 translate-y-12 opacity-50"></div>

        {/* Botón de cerrar */}
        <button
        onClick={onClose}
        className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 hover:rotate-90 transition-all duration-300 p-2 rounded-full hover:bg-surface-100"
        aria-label="Cerrar"
        >
        <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-8 relative">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 shadow-lg">
            <FontAwesomeIcon icon={faHome} className="text-white text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-surface-800 mb-2">Bienvenido a RentUp</h2>
        <p className="text-surface-500 text-sm">Encuentra tu espacio ideal o gestiona tus propiedades</p>
        </div>

        {/* Features */}
        <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 text-surface-600 text-sm">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faShieldHeart} className="text-primary-500 text-sm" />
                </div>
                <span>Propiedades verificadas</span>
            </div>
            <div className="flex items-center gap-3 text-surface-600 text-sm">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500 text-sm" />
                </div>
                <span>Arrendadores confiables</span>
            </div>
        </div>

        {/* Contenido del modal */}
        <div className="space-y-4 relative">
            {/* Botón Regístrate */}
            <div className="space-y-2">
                <p className="text-surface-600 text-sm font-medium">¿No tienes una cuenta?</p>
                <button
                onClick={goToSignup}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3 group"
                >
                <FontAwesomeIcon icon={faUserPlus} className="group-hover:scale-110 transition-transform" />
                <span>Crear cuenta nueva</span>
                </button>
            </div>

            {/* Divisor */}
            <div className="relative flex items-center py-3">
                <div className="flex-grow border-t border-surface-200"></div>
                <span className="flex-shrink mx-4 text-surface-400 text-sm font-medium">o</span>
                <div className="flex-grow border-t border-surface-200"></div>
            </div>

            {/* Botón Inicia Sesión */}
            <div className="space-y-2">
                <p className="text-surface-600 text-sm font-medium">¿Ya tienes cuenta?</p>
                <button
                onClick={goToLogin}
                className="w-full py-4 bg-white hover:bg-surface-50 text-surface-700 rounded-xl font-semibold transition-all duration-300 border-2 border-surface-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-3 group"
                >
                <FontAwesomeIcon icon={faSignInAlt} className="group-hover:scale-110 transition-transform text-surface-500" />
                <span>Iniciar sesión</span>
                </button>
            </div>
        </div>
    </div>
    </div>
);
}

export default Join;
