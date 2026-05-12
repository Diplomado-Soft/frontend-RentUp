import React, { useContext, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faTrash, faExclamationTriangle, faTimes } from "@fortawesome/free-solid-svg-icons";

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
        // cierra solo si se hace click en el overlay (fuera del popup)
        if (event.target.classList && event.target.classList.contains("account-overlay")) onClose();
    };

    // Iniciales para avatar
    const initials = `${(user.nombre || '').charAt(0)}${(user.apellido || '').charAt(0)}`.toUpperCase();
    const firstName = (user.nombre || '').split(' ')[0] || '';

    return (
        <>
            {/* overlay transparente: captura clicks fuera para cerrar, pero no oscurece la app */}
            <div
                className="account-overlay fixed inset-0 z-50"
                onClick={handleOutsideClick}
            >
                <div className="relative w-full h-full">
                    {/* Popup alineado al lado superior derecho (similar al menú de cuenta de Gmail) */}
                    <div className="absolute top-14 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4">
                        {/* Cabecera: email + close */}
                        <div className="flex items-start justify-between">
                            <div className="text-sm text-gray-600 truncate max-w-[60%]">{user.email}</div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 rounded-full p-1"
                                aria-label="Cerrar"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        {/* Avatar y saludo */}
                        <div className="flex flex-col items-center mt-3">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xl font-extrabold shadow-md">
                                {initials || user.email.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="mt-3 text-lg font-semibold text-gray-800">¡Hola, {firstName}!</h3>
                            <button
                                onClick={goToConfigAccount}
                                className="mt-3 px-3 py-1 border rounded-full text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-sm"
                            >
                                Administrar tu Cuenta
                            </button>
                        </div>

                        {/* Información resumida */}
                        <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500">Nombre</span>
                                <span className="text-sm font-semibold text-gray-900">{user.nombre}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500">Apellido</span>
                                <span className="text-sm font-semibold text-gray-900">{user.apellido}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500">Correo</span>
                                <span className="text-sm font-semibold text-gray-900 truncate max-w-[45%]">{user.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500">Teléfono</span>
                                <span className="text-sm font-semibold text-gray-900">{user.telefono || '-'}</span>
                            </div>
                        </div>

                                    {/* Acciones: solo botón de cerrar sesión */}
                                    <div className="mt-4">
                                        <button
                                            onClick={handleLogoutClick}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
                                        >
                                            Cerrar sesión
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="w-full mt-2 text-red-600 hover:text-red-700 text-sm font-medium py-2"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                            Eliminar mi cuenta
                                        </button>
                                    </div>

                        {/* Si el usuario es arrendador, link al panel */}
                        {user.rol === 2 && (
                            <p
                                className="mt-3 text-center text-indigo-600 cursor-pointer hover:underline text-sm"
                                onClick={goToDashboard}
                            >
                                Panel de gestión
                            </p>
                        )}

                    </div>
                </div>
            </div>
        </div>

        {/* Confirmación de logout — overlay en toda la pantalla */}
        {showConfirmLogout && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 max-w-md">
                    <p className="text-center text-gray-700 font-medium text-lg mb-6">¿Estás seguro de que deseas cerrar sesión?</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={confirmLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition"
                        >
                            Sí
                        </button>
                        <button
                            onClick={cancelLogout}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-lg transition"
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal de confirmación de eliminación de cuenta */}
        {showDeleteModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70]">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 max-w-md">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-2xl" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                        ¿Eliminar tu cuenta?
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                        Esta acción es irreversible. Se eliminarán todos tus datos y publicaciones.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
    );
}

export default Account;
