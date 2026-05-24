import React, { useState, useEffect } from "react";
import { getPaymentHistory, registerManualPayment, downloadReceipt } from "../../apis/paymentController";
import axiosInstance from "../../contexts/axiosInstance";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pendientes");
  const [confirming, setConfirming] = useState(null);
  const [confirmMethod, setConfirmMethod] = useState("cash");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [payData, contrData] = await Promise.all([
        getPaymentHistory(),
        axiosInstance.get('/contracts/landlord/contracts').then(r => r.data || [])
      ]);
      setPayments(Array.isArray(payData) ? payData : []);
      setContracts(Array.isArray(contrData) ? contrData : []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirming) return;
    const result = await registerManualPayment({
      agreement_id: confirming.agreement_id,
      amount: confirming.monthly_rent,
      payment_method: confirmMethod
    });
    if (result) {
      setConfirming(null);
      fetchAll();
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusBadge = (status) => {
    const map = {
      completed: 'text-tertiary bg-tertiary/10',
      pending: 'text-secondary bg-secondary/10',
      failed: 'text-error bg-error/10',
      refunded: 'text-outline bg-surface-container-high'
    };
    return map[status] || map.pending;
  };

  const SourceBadge = ({ source, method }) => {
    if (source === 'auto') {
      return <span className="text-[11px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full font-medium">Automático</span>;
    }
    return (
      <span className="text-[11px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-medium">
        {method === 'cash' ? 'Efectivo' : method === 'transfer' ? 'Transferencia' : method}
      </span>
    );
  };

  // Derived data
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthName = now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  const monthlyTotal = payments
    .filter(p => p.status === 'completed' && new Date(p.paid_at || p.created_at || 0) >= thisMonthStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const paidAgreementIdsThisMonth = new Set(
    payments
      .filter(p => p.status === 'completed' && new Date(p.paid_at || p.created_at || 0) >= thisMonthStart)
      .map(p => p.agreement_id)
  );

  const pendingContracts = contracts.filter(c =>
    c.status === 'active' && !paidAgreementIdsThisMonth.has(c.agreement_id)
  );

  const allCompleted = payments
    .filter(p => p.status === 'completed')
    .map(p => ({
      ...p,
      _source: (p.payment_method === 'card' || p.payment_method === 'paypal') ? 'auto' : 'manual'
    }))
    .sort((a, b) => new Date(b.paid_at || b.created_at || 0) - new Date(a.paid_at || a.created_at || 0));

  const tabs = [
    { key: 'pendientes', label: 'Pendientes', count: pendingContracts.length, icon: 'hourglass_empty' },
    { key: 'cobrados', label: 'Cobrados', count: allCompleted.length, icon: 'payments' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total del mes */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-400 rounded-xl p-5">
        <p className="text-label-md text-white/70 uppercase tracking-wider">Total cobrado en</p>
        <p className="font-headline text-headline-lg text-white mt-1">{formatPrice(monthlyTotal)}</p>
        <p className="text-sm text-white/60 capitalize">{thisMonthName}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-high rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-label-md font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
            <span className={`text-label-sm px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key
                ? 'bg-brand-50 text-brand-500'
                : 'bg-surface-container-low text-outline'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab: Pendientes */}
      {activeTab === "pendientes" && (
        <>
          {pendingContracts.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-4xl text-tertiary mb-3">check_circle</span>
              <p className="text-body-md text-on-surface-variant">Todos los contratos están al día</p>
              <p className="text-sm text-outline mt-1">No hay pagos pendientes este mes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingContracts.map(contract => (
                <div key={contract.agreement_id} className="bg-surface-container-low rounded-xl p-4 hover:bg-surface-container-high transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-sm text-secondary">pending</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {contract.barrio || contract.direccion_apt || `Contrato #${contract.agreement_id}`}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {contract.tenant_name} {contract.tenant_lastname}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-on-surface text-sm">{formatPrice(contract.monthly_rent)}</p>
                      <span className="text-[11px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-medium">Pendiente</span>
                    </div>
                  </div>

                  {confirming?.agreement_id === contract.agreement_id ? (
                    <div className="mt-3 pt-3 border-t border-surface-container-high">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-on-surface-variant mr-1">Método:</span>
                        <select
                          value={confirmMethod}
                          onChange={e => setConfirmMethod(e.target.value)}
                          className="text-xs bg-surface text-on-surface rounded-lg px-2.5 py-1.5 border border-outline/30 outline-none"
                        >
                          <option value="cash">Efectivo</option>
                          <option value="transfer">Transferencia</option>
                        </select>
                        <button
                          onClick={handleConfirm}
                          className="flex items-center gap-1 px-3.5 py-1.5 bg-brand-500 text-white rounded-lg text-label-sm hover:opacity-90 transition-all"
                        >
                          <span className="material-symbols-outlined text-xs">check</span>
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirming(null)}
                          className="px-3 py-1.5 text-label-sm text-on-surface-variant hover:text-on-surface transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-surface-container-high flex justify-end">
                      <button
                      onClick={() => { setConfirming(contract); setConfirmMethod("cash"); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white rounded-lg text-label-sm font-medium hover:opacity-90 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">handshake</span>
                        Confirmar pago
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Cobrados */}
      {activeTab === "cobrados" && (
        <>
          {allCompleted.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-4xl text-outline mb-3">receipt_long</span>
              <p className="text-body-md text-on-surface-variant">No hay pagos registrados</p>
              <p className="text-sm text-outline mt-1">Los pagos aparecerán aquí cuando se realicen</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allCompleted.map(payment => (
                <div key={payment.payment_id} className="bg-surface-container-low rounded-xl p-4 hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        payment._source === 'auto' ? 'bg-tertiary/20' : 'bg-secondary/20'
                      }`}>
                        <span className={`material-symbols-outlined text-sm ${
                          payment._source === 'auto' ? 'text-tertiary' : 'text-secondary'
                        }`}>
                          {payment._source === 'auto' ? 'flash_on' : 'handshake'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {payment.barrio || payment.direccion_apt || `Pago #${payment.payment_id}`}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-on-surface-variant">{payment.tenant_name} {payment.tenant_lastname}</span>
                          <span className="text-outline">·</span>
                          <span className="text-xs text-on-surface-variant">{formatDate(payment.paid_at || payment.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-on-surface text-sm">{formatPrice(payment.amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-container-high">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadge(payment.status)}`}>Pagado</span>
                      <SourceBadge source={payment._source} method={payment.payment_method} />
                    </div>
                    <button
                      onClick={() => downloadReceipt(payment.payment_id)}
                      className="flex items-center gap-1 text-label-sm text-brand-500 hover:underline transition-all"
                    >
                      <span className="material-symbols-outlined text-xs">download</span>
                      Recibo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PaymentHistory;
