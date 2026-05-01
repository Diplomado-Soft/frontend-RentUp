import React, { useEffect, useState } from 'react';
import { fetchUserStats } from '../../apis/statsController';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faBuilding, faUser, faEnvelope, faCalendarAlt, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';

const Record = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getStats = async () => {
            try {
                const data = await fetchUserStats();
                console.log('Stats obtenidos:', data);

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

    if (loading) return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="text-surface-500 ml-3">Cargando...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <p className="text-red-500">Error: {error}</p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faChartBar} className="text-white text-lg" />
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Tu estadísticas</h2>
                    <p className="text-sm text-surface-500">Resumen de tus propiedades</p>
                </div>
            </div>

            {stats ? (
                <div className="bg-surface-50 rounded-xl p-4 sm:p-6 border border-surface-200 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-surface-200">
                        <FontAwesomeIcon icon={faBuilding} className="text-primary-600 text-xl" />
                        <div>
                            <p className="font-semibold text-surface-800">Apartamento más arrendado</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-surface-400" />
                            <span className="text-surface-600">Arrendador:</span>
                            <span className="font-medium text-surface-800">{stats.arrendador_nombre} {stats.arrendador_apellido}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-surface-400" />
                            <span className="text-surface-600">Dirección:</span>
                            <span className="font-medium text-surface-800">{stats.direccion_apt}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-surface-400" />
                            <span className="text-surface-600">Barrio:</span>
                            <span className="font-medium text-surface-800">{stats.barrio}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-surface-400" />
                            <span className="text-surface-600">Meses arrendado:</span>
                            <span className="font-medium text-surface-800">{stats.meses_arrendado}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-surface-400" />
                            <span className="text-surface-600">Inicio:</span>
                            <span className="font-medium text-surface-800">{stats.inicio_arrendamiento}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-surface-400" />
                            <span className="text-surface-600">Fin:</span>
                            <span className="font-medium text-surface-800">{stats.fin_arrendamiento}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-surface-400" />
                            <span className="text-surface-600">Inquilino:</span>
                            <span className="font-medium text-surface-800">{stats.inquilino_nombre} {stats.inquilino_apellido}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} className="text-surface-400" />
                            <span className="text-surface-600">Email:</span>
                            <span className="font-medium text-surface-800">{stats.inquilino_email}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-6 bg-surface-50 rounded-xl border border-surface-200 text-center">
                    <p className="text-surface-500">No hay datos todavía.</p>
                </div>
            )}
        </div>
    );
};

export default Record;
