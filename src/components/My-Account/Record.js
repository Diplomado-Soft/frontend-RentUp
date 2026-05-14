import React, { useEffect, useState, useContext } from 'react';
import { fetchUserStats, fetchAdminStats } from '../../apis/statsController';
import { UserContext } from '../../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartBar, faBuilding, faUser, faEnvelope,
    faCalendarAlt, faMapMarkerAlt, faClock,
    faUsers, faHome, faFileContract, faDollarSign,
    faTrophy, faStar
} from '@fortawesome/free-solid-svg-icons';

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white rounded-xl border border-surface-200 p-4 flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <FontAwesomeIcon icon={icon} className="text-white text-lg" />
        </div>
        <div>
            <p className="text-xs text-surface-500">{label}</p>
            <p className="text-xl font-bold text-surface-800">{value}</p>
        </div>
    </div>
);

const AdminStats = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const result = await fetchAdminStats();
                setData(result);
            } catch (err) {
                console.error('Error cargando stats admin:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <LoadingSkeleton />;
    if (error) return <ErrorDisplay message={error} />;
    if (!data) return <EmptyState />;

    const { users = {}, apartments = {}, contracts = {}, topLandlords = [] } = data;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={faUsers} label="Usuarios totales" value={users.total_users} color="bg-blue-600" />
                <StatCard icon={faUser} label="Arrendadores" value={users.total_landlords} color="bg-green-600" />
                <StatCard icon={faUser} label="Inquilinos" value={users.total_tenants} color="bg-purple-600" />
                <StatCard icon={faUser} label="Administradores" value={users.total_admins} color="bg-orange-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={faHome} label="Apartamentos totales" value={apartments.total_apartments} color="bg-indigo-600" />
                <StatCard icon={faHome} label="Aprobados" value={apartments.approved_apartments} color="bg-emerald-600" />
                <StatCard icon={faHome} label="Pendientes" value={apartments.pending_apartments} color="bg-amber-600" />
                <StatCard icon={faHome} label="Rechazados" value={apartments.rejected_apartments} color="bg-red-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={faFileContract} label="Contratos activos" value={contracts.active_contracts} color="bg-teal-600" />
                <StatCard icon={faFileContract} label="Total contratos" value={contracts.total_contracts} color="bg-cyan-600" />
                <StatCard icon={faDollarSign} label="Ingresos mensuales" value={`$${Number(contracts.monthly_revenue).toLocaleString()}`} color="bg-green-700" />
            </div>

            {topLandlords?.length > 0 && (
                <div className="bg-surface-50 rounded-xl p-4 sm:p-6 border border-surface-200">
                    <div className="flex items-center gap-3 pb-3 border-b border-surface-200 mb-4">
                        <FontAwesomeIcon icon={faTrophy} className="text-amber-500 text-xl" />
                        <p className="font-semibold text-surface-800">Top arrendadores</p>
                    </div>
                    <div className="space-y-3">
                        {topLandlords.map((landlord, i) => (
                            <div key={landlord.user_id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-surface-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-surface-800">{landlord.user_name} {landlord.user_lastname}</p>
                                        <p className="text-xs text-surface-500">{landlord.user_email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-surface-600">
                                    <FontAwesomeIcon icon={faStar} className="text-amber-500 text-sm" />
                                    <span className="font-semibold">{landlord.total_apartments} aptos</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const LandlordStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getStats = async () => {
            try {
                const data = await fetchUserStats();
                if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                    setStats(data);
                } else {
                    setStats(null);
                }
            } catch (err) {
                console.error('Error cargando stats', err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        getStats();
    }, []);

    if (loading) return <LoadingSkeleton />;
    if (error) return <ErrorDisplay message={error} />;

    return (
        <div>
            {stats ? (
                <div className="bg-surface-50 rounded-xl p-4 sm:p-6 border border-surface-200 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-surface-200">
                        <FontAwesomeIcon icon={faBuilding} className="text-primary-600 text-xl" />
                        <div>
                            <p className="font-semibold text-surface-800">Apartamento más arrendado</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoRow icon={faUser} label="Arrendador:" value={`${stats.arrendador_nombre} ${stats.arrendador_apellido}`} />
                        <InfoRow icon={faMapMarkerAlt} label="Dirección:" value={stats.direccion_apt} />
                        <InfoRow icon={faMapMarkerAlt} label="Barrio:" value={stats.barrio} />
                        <InfoRow icon={faClock} label="Meses arrendado:" value={stats.meses_arrendado} />
                        <InfoRow icon={faCalendarAlt} label="Inicio:" value={stats.inicio_arrendamiento} />
                        <InfoRow icon={faCalendarAlt} label="Fin:" value={stats.fin_arrendamiento} />
                        <InfoRow icon={faUser} label="Inquilino:" value={`${stats.inquilino_nombre} ${stats.inquilino_apellido}`} />
                        <InfoRow icon={faEnvelope} label="Email:" value={stats.inquilino_email} />
                    </div>
                </div>
            ) : (
                <EmptyState message="No hay datos de arrendamiento todavía. Publica un apartamento y consigue inquilinos para ver tus estadísticas." />
            )}
        </div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={icon} className="text-surface-400 w-4" />
        <span className="text-surface-600 text-sm">{label}</span>
        <span className="font-medium text-surface-800">{value}</span>
    </div>
);

const LoadingSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-surface-500 ml-3">Cargando...</p>
        </div>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <p className="text-red-500">Error: {message}</p>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="p-6 bg-surface-50 rounded-xl border border-surface-200 text-center">
        <p className="text-surface-500">{message || 'No hay datos todavía.'}</p>
    </div>
);

const Record = () => {
    const { user } = useContext(UserContext);
    const userRole = user?.rol || user?.rol_id || null;
    const isAdmin = userRole === 3;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faChartBar} className="text-white text-lg" />
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-surface-800">
                        {isAdmin ? 'Estadísticas globales' : 'Tus estadísticas'}
                    </h2>
                    <p className="text-sm text-surface-500">
                        {isAdmin ? 'Resumen general de la plataforma' : 'Resumen de tus propiedades'}
                    </p>
                </div>
            </div>

            {isAdmin ? <AdminStats /> : <LandlordStats />}
        </div>
    );
};

export default Record;
