import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClipboardList } from '@fortawesome/free-solid-svg-icons';

function Reservations() {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-lg" />
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Reservas</h2>
                    <p className="text-sm text-surface-500">Gestiona tus reservas de propiedades</p>
                </div>
            </div>
            
            <div className="p-6 bg-surface-50 rounded-xl border border-surface-200">
                <div className="flex items-center justify-center gap-3 text-surface-400">
                    <FontAwesomeIcon icon={faClipboardList} className="text-4xl" />
                    <p className="text-surface-500">Próximamente: Gestión de reservas</p>
                </div>
            </div>
        </div>
    );
}
export default Reservations;
