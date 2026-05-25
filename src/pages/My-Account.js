import { useState, useContext, useMemo } from "react";
import User from '../components/My-Account/User';
import Billing from '../components/My-Account/Billing';
import MyRents from '../components/My-Account/MyRents';
import PaymentHistory from '../components/My-Account/PaymentHistory';
import { UserContext } from "../contexts/UserContext";
import { useLocation } from "react-router-dom";
import axiosInstance from "../contexts/axiosInstance";

function MyAccount() {
    const { user } = useContext(UserContext);
    const location = useLocation();

    const userRole = user?.rol || user?.rol_id || user?.rolId || null;
    const userName = user?.nombre || '';
    const userLastname = user?.apellido || '';
    const isLandlord = userRole === 2;

    const tabs = useMemo(() => {
        const allTabs = [
            { key: 'datos', label: 'Mis Datos', icon: 'person', roles: [1, 2, 3] },
            { key: 'facturacion', label: 'Facturación', icon: 'payments', roles: [1] },
            { key: 'pagos', label: 'Mis Cobros', icon: 'payments', roles: [2] },
            { key: 'arriendos', label: 'Mis Arriendos', icon: 'domain', roles: [1] },
            { key: 'eliminar', label: 'Eliminar cuenta', icon: 'delete_forever', roles: [1, 2, 3], danger: true }
        ];
        return allTabs.filter(tab => tab.roles.includes(userRole));
    }, [userRole]);

    const [activeTab, setActiveTab] = useState(() => {
        const stateTab = location.state?.tab;
        if (stateTab && tabs.some(t => t.key === stateTab)) return stateTab;
        return "datos";
    });

    const renderComponent = () => {
        switch (activeTab) {
            case "datos":
                return <User />
            case "facturacion":
                return <Billing />
            case "pagos":
                return <PaymentHistory />
            case "arriendos":
                return <MyRents />
            case "eliminar":
                return (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-5xl text-error mb-4">delete_forever</span>
                        <h3 className="font-headline text-headline-md text-on-surface mb-2">Eliminar cuenta</h3>
                        <p className="text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">
                            ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.
                        </p>
                        <button onClick={async () => {
                            if (window.confirm('¿Confirmas que deseas eliminar tu cuenta?')) {
                                try {
                                    await axiosInstance.delete('/users/delete-account');
                                    alert('Cuenta eliminada correctamente')
                                } catch (error) {
                                    console.error('Error al eliminar la cuenta', error)
                                    alert('Error al eliminar la cuenta')
                                }
                            }
                        }} className="px-6 py-3 bg-error text-on-error font-bold rounded-lg hover:opacity-90 transition-all">
                            Eliminar mi cuenta
                        </button>
                    </div>
                );
            default:
                return <div className="text-on-surface-variant text-center py-12">Selecciona una opción</div>;
        }
    };

    const roleLabel = isLandlord ? 'Arrendador' : userRole === 1 ? 'Usuario' : 'Administrador';
    const initials = (userName.charAt(0) + userLastname.charAt(0)).toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-surface">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 w-full flex-shrink-0">
                        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
                            {/* User profile card */}
                            <div className="bg-brand-50 px-6 py-8 text-center border-b border-brand-500/20">
                                <div className="w-16 h-16 mx-auto rounded-full bg-brand-500 flex items-center justify-center shadow-sm mb-3">
                                    <span className="material-symbols-outlined text-3xl text-white">person</span>
                                </div>
                                <h3 className="font-display text-2xl text-ink">{userName} {userLastname}</h3>
                                <p className="text-label-md text-brand-500 uppercase tracking-wider mt-1">{roleLabel}</p>
                            </div>

                            <nav className="p-3">
                                <ul className="space-y-1">
                                    {tabs.map(tab => (
                                        <li key={tab.key}>
                                            <button
                                                onClick={() => setActiveTab(tab.key)}
                                                className={`flex items-center w-full text-left gap-3 px-4 py-3 rounded-lg text-label-md transition-all ${
                                                activeTab === tab.key
                                                    ? 'bg-brand-100 text-brand-700 font-semibold'
                                                    : tab.danger
                                                        ? 'text-error hover:bg-error/10'
                                                        : 'text-ink-muted hover:bg-line/30 hover:text-ink'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                                <span>{tab.label}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 min-w-0">
                        <div className="mb-8">
                            <h1 className="font-display text-4xl text-ink">Mi Cuenta</h1>
                            <p className="text-body-md text-ink-muted mt-1">
                                {isLandlord
                                    ? 'Gestiona tu información personal, métodos de pago y visualiza tu rendimiento.'
                                    : 'Gestión de arriendos y perfil de usuario'}
                            </p>
                        </div>
                        <div className="bg-surface-container-lowest rounded-xl p-8">
                            {renderComponent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default MyAccount;
