import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar, faCalendarAlt, faMoneyBill, faHome, faCheckCircle, faClock, faDownload, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function Billing() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState(0);
  const [activePayments, setActivePayments] = useState(0);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.token) return;

      const response = await fetch(`${API_URL}/contracts/my-contracts`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setContracts(data);
        const paid = data.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);
        setTotalPaid(paid);
        setActivePayments(data.filter(c => c.status === 'active').length);
      }
    } catch (err) {
      console.error("Error fetching contracts for billing:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return { icon: faCheckCircle, color: 'text-green-500', label: 'Activo' };
      case 'pending': return { icon: faClock, color: 'text-amber-500', label: 'Pendiente' };
      case 'expired': return { icon: faTimesCircle, color: 'text-gray-400', label: 'Vencido' };
      case 'terminated': return { icon: faTimesCircle, color: 'text-red-400', label: 'Terminado' };
      default: return { icon: faClock, color: 'text-gray-400', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Facturación</h2>
          <p className="text-sm text-surface-500">Resumen de pagos y contratos</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-surface-200 shadow-sm">
          <p className="text-xs text-surface-500 uppercase tracking-wide font-medium mb-1">Total pagado</p>
          <p className="text-2xl font-bold text-surface-900">{formatPrice(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-surface-200 shadow-sm">
          <p className="text-xs text-surface-500 uppercase tracking-wide font-medium mb-1">Contratos activos</p>
          <p className="text-2xl font-bold text-primary-600">{activePayments}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-surface-200 shadow-sm">
          <p className="text-xs text-surface-500 uppercase tracking-wide font-medium mb-1">Total contratos</p>
          <p className="text-2xl font-bold text-surface-900">{contracts.length}</p>
        </div>
      </div>

      {/* Contract History */}
      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-surface-200">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-surface-300 text-2xl" />
          </div>
          <p className="text-surface-500 font-medium">No hay facturas disponibles</p>
          <p className="text-surface-400 text-sm mt-1">Cuando realices un arriendo, verás aquí el historial de pagos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(contract => {
            const statusInfo = getStatusIcon(contract.status);
            return (
              <div key={contract.agreement_id} className="bg-white rounded-xl p-5 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faHome} className="text-primary-600 text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-surface-800 truncate">
                        {contract.barrio || "Sin barrio"}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {contract.direccion_apt || "Sin dirección"}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
                          {formatDate(contract.start_date)}
                        </span>
                        <span>—</span>
                        <span>{formatDate(contract.end_date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-surface-900">{formatPrice(contract.monthly_rent)}</p>
                    <p className="text-xs text-surface-400">/mes</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={statusInfo.icon} className={statusInfo.color} />
                    <span className={`text-xs font-medium ${statusInfo.color.replace('text-', 'text-')}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
                    <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                    Recibo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Billing;
