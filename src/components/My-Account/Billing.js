import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function Billing() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState(0);
  const [activePayments, setActivePayments] = useState(0);

  useEffect(() => { fetchContracts(); }, []);

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
        setTotalPaid(data.reduce((sum, c) => sum + (c.monthly_rent || 0), 0));
        setActivePayments(data.filter(c => c.status === 'active').length);
      }
    } catch (err) {
      console.error("Error fetching contracts for billing:", err);
    } finally { setLoading(false); }
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusConfig = {
    active: { label: 'Activo', color: 'text-tertiary' },
    pending: { label: 'Pendiente', color: 'text-secondary' },
    expired: { label: 'Vencido', color: 'text-outline' },
    terminated: { label: 'Terminado', color: 'text-error' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-headline-md text-on-surface mb-1">Facturación y Pagos</h2>
        <p className="text-body-md text-on-surface-variant">Gestiona tus suscripciones y revisa tus facturas recientes.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Total pagado</p>
          <p className="font-headline text-headline-md text-on-surface">{formatPrice(totalPaid)}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Contratos activos</p>
          <p className="font-headline text-headline-md text-primary">{activePayments}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Total contratos</p>
          <p className="font-headline text-headline-md text-on-surface">{contracts.length}</p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-outline mb-4">receipt_long</span>
          <p className="text-on-surface-variant">No hay facturas disponibles</p>
          <p className="text-sm text-outline mt-1">Cuando realices un arriendo, verás aquí el historial de pagos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(contract => {
            const cfg = statusConfig[contract.status] || statusConfig.pending;
            return (
              <div key={contract.agreement_id} className="bg-surface-container-low rounded-xl p-5 hover:bg-surface-container-high transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-sm text-primary">domain</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface truncate">{contract.barrio || "Sin barrio"}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{contract.direccion_apt || "Sin dirección"}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">calendar_today</span>
                          {formatDate(contract.start_date)}
                        </span>
                        <span className="text-outline">—</span>
                        <span>{formatDate(contract.end_date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-on-surface">{formatPrice(contract.monthly_rent)}</p>
                    <p className="text-xs text-on-surface-variant">/mes</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-container-high">
                  <div className="flex items-center gap-2">
                    <span className={`text-label-md ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <button className="flex items-center gap-1 text-label-md text-primary hover:underline transition-all">
                    <span className="material-symbols-outlined text-xs">download</span>
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
