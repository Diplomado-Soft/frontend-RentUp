import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faFileInvoiceDollar, faStar, faHistory, faTrashAlt, faChartBar, faComments, faTimes, faHome } from "@fortawesome/free-solid-svg-icons";
import User from '../components/My-Account/User';
import Billing from '../components/My-Account/Billing';
import Record from '../components/My-Account/Record';
import Reviews from '../components/My-Account/Reviews';
import Reservations from '../components/My-Account/Reservations';
import MyRents from '../components/My-Account/MyRents';
import Messages from '../components/My-Account/Messages';
import History from '../components/My-Account/History';
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

function MyAccount() {
    const [activeTab, setActiveTab] = useState("datos");
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const renderComponent = () => {
        switch (activeTab) {
            case "datos":
                return <User />
            case "facturacion":
                return <Billing />
            case "estadisticas":
                return <Record />
            case "reseñas":
                return <Reviews />
            case "reservas":
                return <Reservations />
            case "mensajes":
                return <Messages />
            case "arriendos":
                return <MyRents />
            case "historial":
                return <History />
            case "eliminar":
                return (
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FontAwesomeIcon icon={faTrashAlt} className="text-red-600 text-2xl" />
                            </div>
                            <h2 className="text-xl font-bold text-surface-800 mb-2">Eliminar cuenta</h2>
                            <p className="text-surface-500 mb-6">¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.</p>
                            <button
                                onClick={() => {
                                    if (window.confirm('¿Confirmas que deseas eliminar tu cuenta?')) {
                                        logout();
                                        navigate('/');
                                    }
                                }}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300"
                            >
                                Eliminar mi cuenta
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div>Selecciona una opción</div>;
        }
    };

    const tabs = [
        { key: 'datos', label: 'Mis datos', icon: faUser },
        { key: 'facturacion', label: 'Facturación', icon: faFileInvoiceDollar },
        { key: 'estadisticas', label: 'Estadísticas', icon: faChartBar },
        { key: 'reseñas', label: 'Reseñas', icon: faStar },
        { key: 'reservas', label: 'Reservas', icon: faHistory },
        ...(user && user.rol === 2 ? [
            { key: 'mensajes', label: 'Mensajes', icon: faComments }
        ] : [
            { key: 'arriendos', label: 'Mis Arriendos', icon: faHome }
        ]),
        { key: 'historial', label: 'Historial', icon: faHistory },
        { key: 'eliminar', label: 'Eliminar cuenta', icon: faTrashAlt, danger: true }
    ];

    return (
        <div className="min-h-[calc(100vh-48px)] sm:min-h-[calc(100vh-56px)] bg-surface-50 py-4 sm:py-6 px-2 sm:px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    {/* Sidebar */}
                    <aside className="lg:w-56 w-full bg-white rounded-xl shadow-lg p-3 sm:p-4 flex-shrink-0">
                        <div className="mb-4 pb-3 border-b border-surface-100">
                            <h3 className="text-base sm:text-lg font-bold text-surface-800">Mi cuenta</h3>
                            <p className="text-xs sm:text-sm text-surface-500">Administra tu información</p>
                        </div>

                        <nav>
                            <ul className="space-y-1">
                                {tabs.map(tab => (
                                    <li key={tab.key}>
                                        <button
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center w-full text-left gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-150 ${
                                                activeTab === tab.key 
                                                    ? 'bg-primary-600 text-white shadow-md' 
                                                    : tab.danger 
                                                        ? 'text-red-600 hover:bg-red-50' 
                                                        : 'text-surface-700 hover:bg-surface-50'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
                                            <span className="truncate">{tab.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>

                    {/* Content area */}
                    <main className="flex-1">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="px-4 sm:px-6 py-4 border-b border-surface-200">
                                <h2 className="text-lg sm:text-xl font-bold text-surface-800 capitalize">
                                    {tabs.find(t => t.key === activeTab)?.label || 'Mis datos'}
                                </h2>
                            </div>

                            <div className="p-3 sm:p-6">
                                {renderComponent()}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default MyAccount;
