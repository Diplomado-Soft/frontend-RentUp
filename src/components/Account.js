import React, { useContext, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from 'react-router-dom';

function Account({ onClose, onLogoutSuccess }) {
    const navigate = useNavigate();
    const { user, logout } = useContext(UserContext);
    const [showConfirmLogout, setShowConfirmLogout] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const userRole = user?.rol || user?.rol_id || user?.rolId || null;

    if (!user) return null;

    const roleName = userRole === 1 ? "USUARIO" : userRole === 2 ? "ARRENDADOR" : userRole === 3 ? "ADMIN" : "DESCONOCIDO";

    const goToConfigAccount = () => { navigate('/my-account'); onClose(); };
    const goToDashboard = () => { navigate('/dashboard'); onClose(); };
    const handleLogoutClick = () => setShowConfirmLogout(true);
    const confirmLogout = () => { 
        logout(); 
        setShowConfirmLogout(false); 
        navigate('/'); 
        if (onLogoutSuccess) onLogoutSuccess();
    };
    const cancelLogout = () => setShowConfirmLogout(false);

    const handleDeleteAccount = async () => {
        try {
            setDeleting(true);
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const token = userData?.token;
            
            if (!token) {
                alert('Sesión expirada');
                logout();
                navigate('/login');
                return;
            }

            const response = await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/users/delete-account`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                logout();
                onClose();
                navigate('/');
            } else if (response.status === 401) {
                logout();
                navigate('/login');
            } else {
                alert('Error al eliminar la cuenta');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la cuenta');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleOutsideClick = (event) => {
        if (event.target.classList && event.target.classList.contains("account-overlay")) onClose();
    };

    const initials = `${(user.nombre || '').charAt(0)}${(user.apellido || '').charAt(0)}`.toUpperCase();
    const firstName = (user.nombre || '').split(' ')[0] || '';

    return (
        <>
            <div
                className="account-overlay fixed inset-0 z-50"
                onClick={handleOutsideClick}
            >
                <div className="relative w-full h-full">
                    <div className="absolute top-14 right-6 w-80 bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="text-body-md text-on-surface-variant truncate max-w-[60%]">{user.email}</div>
                                <button
                                    onClick={onClose}
                                    className="text-outline hover:text-on-surface-variant rounded-full p-1 transition-colors"
                                    aria-label="Cerrar"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>

                            <div className="flex flex-col items-center mt-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary text-headline-md font-bold shadow-lg">
                                    {initials || user.email.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="mt-3 font-headline text-headline-md text-on-surface">¡Hola, {firstName}!</h3>
                                <span className="mt-1 text-label-md uppercase tracking-wider text-primary">{roleName}</span>
                                <button
                                    onClick={goToConfigAccount}
                                    className="mt-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-label-md hover:bg-primary/20 transition-all"
                                >
                                    Administrar tu Cuenta
                                </button>
                            </div>

                            <div className="mt-5 bg-surface-container-low rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-label-md uppercase tracking-wider text-outline">Nombre</span>
                                    <span className="text-body-md font-semibold text-on-surface">{user.nombre}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-label-md uppercase tracking-wider text-outline">Apellido</span>
                                    <span className="text-body-md font-semibold text-on-surface">{user.apellido}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-label-md uppercase tracking-wider text-outline">Correo</span>
                                    <span className="text-body-md font-semibold text-on-surface truncate max-w-[50%]">{user.email}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-label-md uppercase tracking-wider text-outline">Teléfono</span>
                                    <span className="text-body-md font-semibold text-on-surface">{user.telefono || '-'}</span>
                                </div>
                            </div>

                            <div className="mt-5 space-y-2">
                                <button
                                    onClick={handleLogoutClick}
                                    className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">logout</span>
                                    Cerrar sesión
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full text-error text-label-md font-medium py-2 rounded-lg hover:bg-error/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    Eliminar mi cuenta
                                </button>
                            </div>

                            {user.rol === 2 && (
                                <button
                                    className="mt-4 w-full text-label-md text-primary font-medium py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                                    onClick={goToDashboard}
                                >
                                    <span className="material-symbols-outlined text-sm">dashboard</span>
                                    Panel de gestión
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showConfirmLogout && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-80 max-w-md p-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-primary">logout</span>
                            </div>
                        </div>
                        <p className="text-center font-headline text-headline-md text-on-surface mb-2">¿Cerrar sesión?</p>
                        <p className="text-center text-body-md text-on-surface-variant mb-6">¿Estás seguro de que deseas cerrar sesión?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 py-2.5 bg-surface-container-high text-on-surface font-semibold rounded-lg hover:bg-surface-container-highest transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                            >
                                Sí, salir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-80 max-w-md p-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-14 h-14 rounded-full bg-error-container/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-error">warning</span>
                            </div>
                        </div>
                        <h2 className="font-headline text-headline-md text-on-surface text-center mb-2">
                            ¿Eliminar tu cuenta?
                        </h2>
                        <p className="text-body-md text-on-surface-variant text-center mb-6">
                            Esta acción es irreversible. Se eliminarán todos tus datos y publicaciones.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 bg-surface-container-high text-on-surface font-semibold rounded-lg hover:bg-surface-container-highest transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                                className="flex-1 py-2.5 bg-error text-on-error font-semibold rounded-lg hover:bg-error/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                                        Eliminando...
                                    </>
                                ) : (
                                    'Sí, eliminar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Account;
