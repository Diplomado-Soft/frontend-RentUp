import React, { useEffect, useState, useContext } from 'react';
import { fetchUserStats, fetchAdminStats } from '../../apis/statsController';
import { UserContext } from '../../contexts/UserContext';

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-surface-container-low rounded-xl p-5 flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <span className="material-symbols-outlined text-white text-lg">{icon}</span>
        </div>
        <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider">{label}</p>
            <p className="font-headline text-headline-md text-on-surface">{value}</p>
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
            } finally { setLoading(false); }
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
                <StatCard icon="group" label="Usuarios totales" value={users.total_users} color="bg-secondary" />
                <StatCard icon="person" label="Arrendadores" value={users.total_landlords} color="bg-tertiary" />
                <StatCard icon="person" label="Inquilinos" value={users.total_tenants} color="bg-primary" />
                <StatCard icon="admin_panel_settings" label="Administradores" value={users.total_admins} color="bg-[#ff9800]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="domain" label="Apartamentos totales" value={apartments.total_apartments} color="bg-secondary" />
                <StatCard icon="check_circle" label="Aprobados" value={apartments.approved_apartments} color="bg-tertiary" />
                <StatCard icon="hourglass" label="Pendientes" value={apartments.pending_apartments} color="bg-[#f59e0b]" />
                <StatCard icon="cancel" label="Rechazados" value={apartments.rejected_apartments} color="bg-error" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon="description" label="Contratos activos" value={contracts.active_contracts} color="bg-tertiary" />
                <StatCard icon="description" label="Total contratos" value={contracts.total_contracts} color="bg-secondary" />
                <StatCard icon="payments" label="Ingresos mensuales" value={`$${Number(contracts.monthly_revenue).toLocaleString()}`} color="bg-tertiary" />
            </div>
            {topLandlords?.length > 0 && (
                <div className="bg-surface-container-low rounded-xl p-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-surface-container-high mb-4">
                        <span className="material-symbols-outlined text-amber-500">workspace_premium</span>
                        <p className="font-headline text-headline-md text-on-surface">Top arrendadores</p>
                    </div>
                    <div className="space-y-3">
                        {topLandlords.map((landlord, i) => (
                            <div key={landlord.user_id} className="flex items-center justify-between bg-surface-container-lowest rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-outline' : 'bg-amber-700'}`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-on-surface">{landlord.user_name} {landlord.user_lastname}</p>
                                        <p className="text-xs text-on-surface-variant">{landlord.user_email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
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
            } finally { setLoading(false); }
        };
        getStats();
    }, []);

    if (loading) return <LoadingSkeleton />;
    if (error) return <ErrorDisplay message={error} />;

    return (
        <div>
            {stats ? (
                <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-surface-container-high">
                        <span className="material-symbols-outlined text-primary">domain</span>
                        <p className="font-headline text-headline-md text-on-surface">Apartamento más arrendado</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoRow icon="person" label="Arrendador:" value={`${stats.arrendador_nombre} ${stats.arrendador_apellido}`} />
                        <InfoRow icon="location_on" label="Dirección:" value={stats.direccion_apt} />
                        <InfoRow icon="location_on" label="Barrio:" value={stats.barrio} />
                        <InfoRow icon="schedule" label="Meses arrendado:" value={stats.meses_arrendado} />
                        <InfoRow icon="calendar_today" label="Inicio:" value={stats.inicio_arrendamiento} />
                        <InfoRow icon="event" label="Fin:" value={stats.fin_arrendamiento} />
                        <InfoRow icon="person" label="Inquilino:" value={`${stats.inquilino_nombre} ${stats.inquilino_apellido}`} />
                        <InfoRow icon="mail" label="Email:" value={stats.inquilino_email} />
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
        <span className="material-symbols-outlined text-sm text-outline w-5">{icon}</span>
        <span className="text-on-surface-variant text-sm">{label}</span>
        <span className="font-medium text-on-surface">{value}</span>
    </div>
);

const LoadingSkeleton = () => (
    <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="p-6 text-center">
        <p className="text-error">Error: {message}</p>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-3">bar_chart</span>
        <p className="text-on-surface-variant">{message || 'No hay datos todavía.'}</p>
    </div>
);

const Record = () => {
    const { user } = useContext(UserContext);
    const userRole = user?.rol || user?.rol_id || null;
    const isAdmin = userRole === 3;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="font-headline text-headline-md text-on-surface mb-1">
                    {isAdmin ? 'Estadísticas globales' : 'Tus estadísticas'}
                </h2>
                <p className="text-body-md text-on-surface-variant">
                    {isAdmin ? 'Resumen general de la plataforma' : 'Resumen de tus propiedades'}
                </p>
            </div>
            {isAdmin ? <AdminStats /> : <LandlordStats />}
        </div>
    );
};

export default Record;
