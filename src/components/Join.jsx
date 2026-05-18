import React from "react";
import { useNavigate } from "react-router-dom";

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

const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
};

return (
    <div onClick={handleOverlayClick} className="fixed inset-0 flex items-center justify-center bg-ink/60 backdrop-blur-sm z-50 p-4">
    <div className="bg-paper-card rounded-[28px] shadow-2xl w-full max-w-md relative overflow-hidden">

        {/* Background decorative blob */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-brand-500/10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-moss-500/10 rounded-full"></div>

        {/* Close button */}
        <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-ink-muted hover:text-ink transition-colors p-2 rounded-full hover:bg-paper-sunk cursor-pointer"
            aria-label="Cerrar"
        >
            <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Content */}
        <div className="p-8 relative">
            {/* Icon + header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4 shadow-lg">
                    <span className="material-symbols-outlined text-paper text-2xl">home</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-ink mb-2">Bienvenido a RentUp</h2>
                <p className="text-ink-muted text-sm">Encuentra tu espacio ideal o gestiona tus propiedades</p>
            </div>

            {/* Features */}
            <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 text-ink text-sm">
                    <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-sm text-brand-500">verified</span>
                    </div>
                    <span>Propiedades verificadas</span>
                </div>
                <div className="flex items-center gap-3 text-ink text-sm">
                    <div className="w-8 h-8 bg-moss-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-sm text-moss-500">shield</span>
                    </div>
                    <span>Arrendadores confiables</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="space-y-4">
                {/* Register */}
                <div className="space-y-2">
                    <p className="text-ink-muted text-xs font-medium text-center">¿No tienes una cuenta?</p>
                    <button
                        onClick={goToSignup}
                        className="w-full py-3 bg-brand-500 hover:bg-brand-400 text-paper rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        <span>Registrarse</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-line"></div>
                    <span className="flex-shrink mx-4 text-ink-muted text-xs font-medium">o</span>
                    <div className="flex-grow border-t border-line"></div>
                </div>

                {/* Login */}
                <div className="space-y-2">
                    <p className="text-ink-muted text-xs font-medium text-center">¿Ya tienes cuenta?</p>
                    <button
                        onClick={goToLogin}
                        className="w-full py-3 bg-paper-card hover:bg-paper-sunk text-ink rounded-full font-semibold transition-all duration-300 border border-line hover:border-ink-muted flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">login</span>
                        <span>Iniciar sesión</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    </div>
);
}

export default Join;
