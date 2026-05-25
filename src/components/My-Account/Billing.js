import React, { useState, useEffect } from "react";
import PaymentModal from "../Payment/PaymentModal";
import { getPaymentHistory, downloadReceipt } from "../../apis/paymentController";
import { renewContract, endContract } from "../../apis/contractController";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function Billing() {
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [activeTab, setActiveTab] = useState("contracts");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.token) return;

      const [contractsRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/contracts/my-contracts`, {
          headers: { Authorization: `Bearer ${userData.token}` }
        }),
        getPaymentHistory()
      ]);

      const contractsData = await contractsRes.json();
      if (contractsRes.ok && Array.isArray(contractsData)) setContracts(contractsData);
      if (Array.isArray(paymentsRes)) setPayments(paymentsRes);
    } catch (err) {
      console.error("Error fetching billing data:", err);
    } finally { setLoading(false); }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);
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

  const paymentStatusConfig = {
    completed: { label: 'Pagado', color: 'text-tertiary bg-tertiary/10' },
    pending: { label: 'Pendiente', color: 'text-secondary bg-secondary/10' },
    failed: { label: 'Fallido', color: 'text-error bg-error/10' },
    refunded: { label: 'Reembolsado', color: 'text-outline bg-surface-container-high' }
  };

  const handlePayClick = (contract) => {
    setSelectedContract(contract);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (result) => {
    fetchData();
  };

  const daysUntilEnd = (endDate) => {
    if (!endDate) return 999;
    return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const handleRenew = async (agreement_id) => {
    if (!window.confirm("¿Renovar contrato por 12 meses más?")) return;
    const result = await renewContract(agreement_id, 12);
    if (result) {
      alert("Contrato renovado exitosamente");
      fetchData();
    } else {
      alert("Error al renovar el contrato");
    }
  };

  const handleEndContract = async (agreement_id) => {
    if (!window.confirm("¿Finalizar contrato y marcar vivienda como disponible?")) return;
    const result = await endContract(agreement_id);
    if (result) {
      alert("Contrato finalizado. La vivienda ya está disponible.");
      fetchData();
    } else {
      alert("Error al finalizar el contrato");
    }
  };

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const activeContracts = contracts.filter(c => c.status === 'active');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl text-ink mb-1">Facturación y Pagos</h2>
        <p className="text-body-md text-ink-muted">Gestiona tus pagos de arriendo y revisa tus recibos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Total pagado</p>
          <p className="font-headline text-headline-md text-on-surface">{formatPrice(totalPaid)}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Contratos activos</p>
          <p className="font-display text-2xl text-brand-500">{activeContracts.length}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Total contratos</p>
          <p className="font-headline text-headline-md text-on-surface">{contracts.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-surface-container-high">
        <button
          onClick={() => setActiveTab("contracts")}
          className={`pb-3 text-label-md font-medium transition-colors ${
            activeTab === "contracts" ? "text-brand-500 border-b-2 border-brand-500" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Contratos
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-label-md font-medium transition-colors ${
            activeTab === "history" ? "text-brand-500 border-b-2 border-brand-500" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Historial de Pagos
        </button>
      </div>

      {activeTab === "contracts" && (
        <>
          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-outline mb-4">receipt_long</span>
              <p className="text-on-surface-variant">No hay facturas disponibles</p>
              <p className="text-sm text-outline mt-1">Cuando realices un arriendo, verás aquí tus contratos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map(contract => {
                const cfg = statusConfig[contract.status] || statusConfig.pending;
                const contractPayments = payments.filter(p => p.agreement_id === contract.agreement_id);
                const lastPayment = [...contractPayments]
                  .sort((a, b) => new Date(b.paid_at || b.created_at || 0) - new Date(a.paid_at || a.created_at || 0))
                  .find(p => p.status === 'completed');
                return (
                  <div key={contract.agreement_id} className="bg-surface-container-low rounded-xl p-5 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-sm text-brand-500">domain</span>
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
                        {lastPayment && (
                          <span className="text-label-md text-tertiary">· Pagado el {formatDate(lastPayment.paid_at)}</span>
                        )}
                        {contract.status === 'active' && daysUntilEnd(contract.end_date) <= 30 && (
                          <span className="text-label-md text-secondary">· Vence en {daysUntilEnd(contract.end_date)} días</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {contract.status === 'active' && (
                          <>
                            {daysUntilEnd(contract.end_date) <= 30 && (
                              <button
                                onClick={() => handleRenew(contract.agreement_id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-tertiary text-white text-label-md rounded-lg hover:bg-tertiary/90 transition-all"
                              >
                                <span className="material-symbols-outlined text-xs">autorenew</span>
                                Renovar
                              </button>
                            )}
                            <button
                              onClick={() => handlePayClick(contract)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-brand-500 text-white text-label-md rounded-lg hover:bg-brand-500/90 transition-all"
                            >
                              <span className="material-symbols-outlined text-xs">payments</span>
                              Pagar ahora
                            </button>
                            <button
                              onClick={() => handleEndContract(contract.agreement_id)}
                              className="flex items-center gap-1 px-3 py-1.5 border border-error text-error text-label-md rounded-lg hover:bg-error/5 transition-all"
                            >
                              <span className="material-symbols-outlined text-xs">cancel</span>
                              Finalizar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (lastPayment) {
                              downloadReceipt(lastPayment.payment_id);
                            }
                          }}
                          className={`flex items-center gap-1 text-label-md transition-all ${
                            lastPayment ? "text-brand-500 hover:underline" : "text-outline cursor-not-allowed"
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">download</span>
                          Recibo
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === "history" && (
        <>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-outline mb-4">receipt_long</span>
              <p className="text-on-surface-variant">No hay pagos registrados</p>
              <p className="text-sm text-outline mt-1">Cuando realices un pago, aparecerá aquí el historial</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map(payment => {
                const cfg = paymentStatusConfig[payment.status] || paymentStatusConfig.pending;
                return (
                  <div key={payment.payment_id} className="bg-surface-container-low rounded-xl p-4 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          payment.status === 'completed' ? 'bg-tertiary/20' : 'bg-secondary/20'
                        }`}>
                          <span className={`material-symbols-outlined text-sm ${
                            payment.status === 'completed' ? 'text-tertiary' : 'text-secondary'
                          }`}>
                            {payment.status === 'completed' ? 'check_circle' : 'schedule'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">
                            {payment.barrio || payment.direccion_apt || `Pago #${payment.payment_id}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                            <span>{formatDate(payment.paid_at || payment.created_at)}</span>
                            <span>·</span>
                            <span className="capitalize">{payment.payment_method === 'card' ? 'Tarjeta' : payment.payment_method}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-on-surface">{formatPrice(payment.amount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-container-high">
                      <span className={`text-label-md px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      {payment.status === 'completed' && (
                        <button
                          onClick={() => downloadReceipt(payment.payment_id)}
                          className="flex items-center gap-1 text-label-md text-brand-500 hover:underline transition-all"
                        >
                          <span className="material-symbols-outlined text-xs">download</span>
                          Recibo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showPaymentModal && selectedContract && (
        <PaymentModal
          contract={selectedContract}
          onClose={() => { setShowPaymentModal(false); setSelectedContract(null); }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default Billing;
