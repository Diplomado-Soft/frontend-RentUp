import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import axiosInstance from "../contexts/axiosInstance";
import ChatComponent from "../components/ChatComponent";
import ContractSigner from "../components/ContractSigner";
import VisitScheduler from "../components/VisitScheduler";
import TenantVisits from "../components/TenantVisits";
import { getMyReports, createMaintenanceReport, getMyProperties } from "../apis/maintenanceController";
import { getPaymentHistory, downloadReceipt } from "../apis/paymentController";
import PaymentModal from "../components/Payment/PaymentModal";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const STRIPE_PK = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;

function TenantDashboard() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("mis-arriendos");

  const [contracts, setContracts] = useState([]);
  const [reports, setReports] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentContract, setSelectedPaymentContract] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportProperties, setReportProperties] = useState([]);
  const [reportForm, setReportForm] = useState({ property_id: "", title: "", description: "", priority: "medium" });
  const [reportImage, setReportImage] = useState(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const userId = user?.id || user?.user_id;

  const fetchContracts = async () => {
    try {
      setLoadingContracts(true);
      const res = await axiosInstance.get("/contracts/my-contracts");
      setContracts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching contracts:", err);
    } finally {
      setLoadingContracts(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const res = await getMyReports();
      if (res.success) setReports(res.data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await getPaymentHistory();
      if (Array.isArray(res)) setPayments(res);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  const getContractPayment = (agreementId) => {
    return payments.find(p => p.agreement_id === agreementId && p.status === 'completed');
  };

  useEffect(() => {
    fetchContracts();
    fetchReports();
    fetchPayments();
  }, []);

  const activeContracts = contracts.filter((c) => c.status === "active");
  const pastContracts = contracts.filter((c) => c.status !== "active");
  const totalMonthlyRent = activeContracts.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);
  const pendingReports = reports.filter((r) => r.status === "pending" || r.status === "in_progress");

  const landlords = activeContracts.reduce((acc, c) => {
    if (c.landlord_id && !acc.some((l) => l.id === c.landlord_id)) {
      acc.push({
        id: c.landlord_id,
        name: c.landlord_name || "Arrendador",
        lastname: c.landlord_lastname || "",
        email: c.landlord_email || "",
        phone: c.landlord_phone || "",
        properties: activeContracts.filter((x) => x.landlord_id === c.landlord_id).map((x) => ({
          name: x.barrio_name || x.barrio || "Sin barrio",
          address: x.direccion_apt || "",
        })),
      });
    }
    return acc;
  }, []);

  const [selectedLandlordId, setSelectedLandlordId] = useState(
    landlords.length > 0 ? landlords[0].id : null
  );
  const selectedLandlord = landlords.find((l) => l.id === selectedLandlordId) || null;

  const daysToNearestEnd = activeContracts.length > 0
    ? Math.min(
        ...activeContracts.map((c) =>
          c.end_date ? Math.ceil((new Date(c.end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 999
        )
      )
    : null;

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(price || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-secondary/10 text-secondary",
      active: "bg-tertiary/10 text-tertiary",
      expired: "bg-surface-container-high text-outline",
      terminated: "bg-error-container/30 text-error",
    };
    const labels = {
      pending: "Pendiente",
      active: "Vigente",
      expired: "Vencido",
      terminated: "Terminado",
    };
    return (
      <span className={`text-label-md px-3 py-1 rounded-full ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const firstName = (user?.nombre || user?.user_name || "").split(" ")[0] || "Usuario";
  const initials = `${(user?.nombre || user?.user_name || "").charAt(0)}${(user?.apellido || user?.user_lastname || "").charAt(0)}`.toUpperCase() || "?";

  const navItems = [
    { id: "mis-arriendos", label: "Mis Arriendos", icon: "domain" },
    { id: "proximos-pagos", label: "Próximos Pagos", icon: "payments" },
    { id: "mis-reportes", label: "Mis Reportes", icon: "build" },
    { id: "contacto", label: "Contacto", icon: "chat" },
    { id: "visitas", label: "Visitas", icon: "calendar_month" },
    { id: "documentos", label: "Documentos", icon: "description" },
  ];

  const statCards = [
    {
      label: "Contratos Activos",
      value: activeContracts.length,
      type: "contracts",
    },
    {
      label: "Pagos Mensuales",
      value: formatPrice(totalMonthlyRent),
      type: "payments",
    },
    {
      label: "Reportes Pendientes",
      value: pendingReports.length,
      type: "reports",
    },
    {
      label: daysToNearestEnd !== null && daysToNearestEnd > 0 ? "Días Restantes" : "Sin contrato activo",
      value: daysToNearestEnd !== null && daysToNearestEnd > 0 ? daysToNearestEnd : "-",
      type: "days",
      circleValue: daysToNearestEnd !== null && daysToNearestEnd > 0
        ? Math.max(5, Math.min(100, Math.round((daysToNearestEnd / 365) * 100)))
        : null,
    },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <div className="flex">
        <aside className="fixed left-0 top-0 h-screen pt-14 w-60 bg-paper-sunk border-r border-line z-30">
          <div className="flex flex-col h-full p-3">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-brand-100 text-brand-700 font-semibold"
                      : "text-ink-muted hover:text-ink hover:bg-line/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg flex-shrink-0">{item.icon}</span>
                  <span className="text-label-md font-medium truncate">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="pt-3 mt-3 border-t border-line">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-label-md font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="truncate">
                    <p className="text-label-md font-medium text-ink truncate">{firstName}</p>
                    <p className="text-label-md text-ink-muted uppercase tracking-wider">INQUILINO</p>
                  </div>
                </div>
              </div>
          </div>
        </aside>

        <div className="flex-1 ml-60">
          <div className="px-6 py-6">
            <div className="mb-3">
              <h1 className="font-display text-5xl md:text-7xl leading-none text-brand-500 mb-2">
                Bienvenido a tu espacio, {firstName}
              </h1>
              <p className="text-body-md text-ink-soft">
                Aquí puedes gestionar tus arriendos, pagos y más.
              </p>
            </div>

            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
              {activeTab === "mis-arriendos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-headline text-headline-md text-ink">Mis Arriendos Activos</h2>
                      <p className="text-body-md text-ink-muted">
                        {activeContracts.length} contrato{activeContracts.length !== 1 ? "s" : ""} vigente
                        {activeContracts.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={fetchContracts}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-label-md text-ink-muted hover:text-ink hover:bg-line/30 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Actualizar
                    </button>
                  </div>

                  {loadingContracts ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                      <p className="text-ink-muted">Cargando arriendos...</p>
                    </div>
                  ) : contracts.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-5xl text-outline mb-4">domain</span>
                      <h3 className="font-headline text-headline-md text-ink mb-2">No tienes arriendos</h3>
                      <p className="text-ink-muted">Cuando arriendes una propiedad, aparecerá aquí</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeContracts.map((rent) => {
                        const daysRemaining = getDaysRemaining(rent.end_date);
                        return (
                          <div key={rent.agreement_id} className="bg-paper-card rounded-xl shadow-ambient-sm hover:shadow-ambient-md transition-shadow overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="flex-1 min-w-0 p-5 flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h3 className="font-headline text-headline-md text-ink">
                                      {rent.barrio_name || rent.barrio || "Sin barrio"}
                                    </h3>
                                    <p className="flex items-center gap-1.5 text-body-md text-ink-muted mt-0.5">
                                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                                      {rent.direccion_apt || ""}
                                    </p>
                                  </div>
                                  {getStatusBadge(rent.status)}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-paper-sunk rounded-lg p-3">
                                    <p className="flex items-center gap-1.5 text-label-sm text-ink-muted mb-1">
                                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                      Inicio
                                    </p>
                                    <p className="text-label-md font-medium text-ink">{formatDate(rent.start_date)}</p>
                                  </div>
                                  <div className="bg-paper-sunk rounded-lg p-3">
                                    <p className="flex items-center gap-1.5 text-label-sm text-ink-muted mb-1">
                                      <span className="material-symbols-outlined text-[14px]">event</span>
                                      Fin
                                    </p>
                                    <p className="text-label-md font-medium text-ink">{formatDate(rent.end_date)}</p>
                                  </div>
                                </div>

                                {daysRemaining !== null && daysRemaining > 0 && (
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-label-sm text-ink-muted">Tiempo restante</span>
                                      <span className={`text-label-sm font-medium ${
                                        daysRemaining <= 30 ? 'text-error' : 'text-ink-muted'
                                      }`}>
                                        {daysRemaining} días
                                      </span>
                                    </div>
                                    <div className="h-2 bg-line rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          daysRemaining <= 30
                                            ? 'bg-error'
                                            : daysRemaining <= 90
                                              ? 'bg-ember'
                                              : 'bg-tertiary'
                                        }`}
                                        style={{ width: `${Math.max(5, Math.min(100, (daysRemaining / 365) * 100))}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <p className="text-label-sm text-ink-muted mb-0.5">Valor del arriendo</p>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="material-symbols-outlined text-brand-500 text-lg">payments</span>
                                    <span className="font-headline font-bold text-headline-md text-brand-500">
                                      {formatPrice(rent.monthly_rent)}
                                    </span>
                                    <span className="text-ink-muted text-sm"> /mes</span>
                                  </div>
                                </div>

                                {rent.landlord_name && (
                                  <div className="flex items-center gap-1.5 text-sm text-ink-muted pt-1">
                                    <span className="material-symbols-outlined text-[16px]">person</span>
                                    <span>Arrendador: <strong className="text-ink">{rent.landlord_name} {rent.landlord_lastname || ""}</strong></span>
                                  </div>
                                )}
                              </div>

                              <div className="w-full md:w-1/2 h-48 md:h-auto bg-paper-sunk overflow-hidden">
                                {rent.images && rent.images.length > 0 && rent.images[0]?.url ? (
                                  <img
                                    src={rent.images[0].url}
                                    alt="Vivienda"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl text-outline">image</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {pastContracts.length > 0 && (
                        <div className="pt-6 border-t border-line">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-px flex-1 bg-line"/>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-ink-muted"></span>
                              <h3 className="font-headline text-headline-sm text-ink-muted uppercase tracking-wider">
                                Arriendos Anteriores
                              </h3>
                            </div>
                            <div className="h-px flex-1 bg-line"/>
                          </div>
                          <div className="space-y-3">
                            {pastContracts.map((rent) => (
                              <div
                                key={rent.agreement_id}
                                className="bg-paper-card rounded-xl p-4 opacity-60 hover:opacity-100 transition-opacity"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h4 className="font-headline font-semibold text-ink truncate">
                                        {rent.barrio_name || rent.barrio || "Sin barrio"}
                                      </h4>
                                      {getStatusBadge(rent.status)}
                                    </div>
                                    <p className="text-sm text-ink-muted truncate">{rent.direccion_apt || ""}</p>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-ink-muted">
                                      <span>
                                        {formatDate(rent.start_date)} — {formatDate(rent.end_date)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                      <p className="font-headline font-semibold text-ink">{formatPrice(rent.monthly_rent)}</p>
                      <p className="text-xs text-ink-muted">/mes</p>
                      </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "proximos-pagos" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-headline text-headline-md text-ink mb-1">Próximos Pagos</h2>
                    <p className="text-body-md text-ink-muted">Resumen de tus pagos de arriendo</p>
                  </div>

                  {loadingContracts ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    </div>
                  ) : activeContracts.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-outline mb-4">receipt_long</span>
                      <p className="text-ink-muted">No tienes contratos activos</p>
                      <p className="text-sm text-outline mt-1">Los pagos aparecerán cuando tengas un arriendo vigente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-surface-container-low rounded-xl p-5">
                          <p className="text-label-md text-ink-muted uppercase tracking-wider mb-1">Total mensual</p>
                          <p className="font-headline text-headline-md text-ink">{formatPrice(totalMonthlyRent)}</p>
                        </div>
                        <div className="bg-surface-container-low rounded-xl p-5">
                          <p className="text-label-md text-ink-muted uppercase tracking-wider mb-1">Contratos activos</p>
                          <p className="font-headline text-headline-md text-primary">{activeContracts.length}</p>
                        </div>
                        <div className="bg-surface-container-low rounded-xl p-5">
                          <p className="text-label-md text-ink-muted uppercase tracking-wider mb-1">
                            {daysToNearestEnd !== null && daysToNearestEnd > 0
                              ? "Próximo vencimiento"
                              : "Sin vencimiento"}
                          </p>
                          <p
                            className={`font-headline text-headline-md ${
                              daysToNearestEnd !== null && daysToNearestEnd <= 30 ? "text-error" : "text-tertiary"
                            }`}
                          >
                            {daysToNearestEnd !== null && daysToNearestEnd > 0
                              ? `${daysToNearestEnd} días`
                              : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {activeContracts.map((contract) => {
                          const daysRemaining = getDaysRemaining(contract.end_date);
                          return (
                            <div
                              key={contract.agreement_id}
                              className="bg-surface-container-low rounded-xl p-5 hover:bg-surface-container-high transition-colors"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-sm text-primary">domain</span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-headline font-semibold text-ink truncate">
                                      {contract.barrio_name || contract.barrio || "Sin barrio"}
                                    </p>
                                    <p className="text-xs text-ink-muted mt-0.5 truncate">
                                      {contract.direccion_apt || "Sin dirección"}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted">
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
                                  <p className="font-headline font-bold text-ink">{formatPrice(contract.monthly_rent)}</p>
                                  <p className="text-xs text-ink-muted">/mes</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-container-high">
                                <div className="flex items-center gap-2">
                                  <span className="text-label-md text-tertiary">Al día</span>
                                  {daysRemaining !== null && daysRemaining > 0 && (
                                    <span
                                      className={`text-label-md ${
                                        daysRemaining <= 30 ? "text-error" : "text-ink-muted"
                                      }`}
                                    >
                                      · Vence en {daysRemaining} días
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    const payment = getContractPayment(contract.agreement_id);
                                    if (payment) {
                                      downloadReceipt(payment.payment_id);
                                    } else {
                                      setSelectedPaymentContract(contract);
                                      setShowPaymentModal(true);
                                    }
                                  }}
                                  className="flex items-center gap-1 text-label-md text-primary hover:underline transition-all"
                                >
                                  <span className="material-symbols-outlined text-xs">
                                    {getContractPayment(contract.agreement_id) ? 'download' : 'payments'}
                                  </span>
                                  {getContractPayment(contract.agreement_id) ? 'Recibo' : 'Pagar'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {pastContracts.length > 0 && (
                        <div>
                          <h3 className="font-headline text-headline-sm text-ink mb-3 mt-6">Historial de pagos</h3>
                          <div className="space-y-2">
                            {pastContracts.map((contract) => (
                              <div
                                key={contract.agreement_id}
                                className="bg-surface-container-low rounded-xl p-4 opacity-70"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="material-symbols-outlined text-outline">receipt</span>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-ink truncate">
                                        {contract.barrio_name || contract.barrio || "Sin barrio"}
                                      </p>
                                      <p className="text-xs text-ink-muted">
                                        {formatDate(contract.start_date)} — {formatDate(contract.end_date)}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm font-semibold text-ink">{formatPrice(contract.monthly_rent)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "mis-reportes" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-headline text-headline-md text-ink mb-1">Mis Reportes de Mantenimiento</h2>
                      <p className="text-body-md text-ink-muted">
                        {reports.length} reporte{reports.length !== 1 ? "s" : ""} realizado
                        {reports.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        getMyProperties().then((res) => { if (res.success) setReportProperties(res.data || []); }).catch(() => {});
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-label-md bg-brand-500 text-white hover:bg-brand-600 transition-all"
                    >
                      Nuevo Reporte
                    </button>
                  </div>

                  {loadingReports ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-outline mb-4">handyman</span>
                      <p className="text-ink-muted">No has realizado reportes de mantenimiento</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reports.map((r) => (
                        <div
                          key={r.id}
                          className="bg-surface-container-low rounded-xl overflow-hidden border border-line/50 hover:border-line transition-all"
                        >
                          {r.image_url ? (
                            <div className="relative aspect-video overflow-hidden">
                              <img
                                src={r.image_url}
                                alt="Reporte"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-paper-sunk flex items-center justify-center">
                              <span className="material-symbols-outlined text-3xl text-outline">handyman</span>
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-headline font-semibold text-ink leading-tight truncate">{r.title}</h4>
                            </div>
                            <p className="text-label-md text-ink-muted mb-3 truncate">
                              {r.direccion_apt} - {r.barrio}
                            </p>
                            {r.description && (
                              <p className="text-body-sm text-ink-muted mb-3 line-clamp-2">{r.description}</p>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                              <span
                                className={`text-label-md px-2 py-0.5 rounded-full ${
                                  r.priority === "urgent"
                                    ? "bg-error/10 text-error"
                                    : r.priority === "high"
                                      ? "bg-warning/10 text-warning"
                                      : r.priority === "medium"
                                        ? "bg-secondary/10 text-secondary"
                                        : "bg-surface-container-high text-outline"
                                }`}
                              >
                                {r.priority === "urgent"
                                  ? "Urgente"
                                  : r.priority === "high"
                                    ? "Alta"
                                    : r.priority === "medium"
                                      ? "Media"
                                      : "Baja"}
                              </span>
                              <span
                                className={`text-label-md px-2 py-0.5 rounded-full ${
                                  r.status === "resolved"
                                    ? "bg-tertiary/10 text-tertiary"
                                    : r.status === "in_progress"
                                      ? "bg-secondary/10 text-secondary"
                                      : r.status === "rejected"
                                        ? "bg-error/10 text-error"
                                        : "bg-warning/10 text-warning"
                                }`}
                              >
                                {r.status === "resolved"
                                  ? "Resuelto"
                                  : r.status === "in_progress"
                                    ? "En Proceso"
                                    : r.status === "rejected"
                                      ? "Rechazado"
                                      : "Pendiente"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-label-sm text-ink-muted">
                              <span>
                                {new Date(r.created_at).toLocaleDateString("es-CO", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              {r.landlord_notes && (
                                <span className="italic truncate ml-2" title={r.landlord_notes}>
                                  Nota
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "contacto" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-headline text-headline-md text-ink mb-1">Contacto con tus Arrendadores</h2>
                    <p className="text-body-md text-ink-muted">Comunicación directa y en tiempo real</p>
                  </div>

                  {landlords.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-outline mb-4">chat</span>
                      <h3 className="font-headline text-headline-md text-ink mb-2">Sin arrendador activo</h3>
                      <p className="text-ink-muted">
                        Necesitas un contrato activo para contactar a tu arrendador
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {landlords.length > 1 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-label-md text-ink-muted uppercase tracking-wider">Arrendadores:</span>
                          {landlords.map((l) => (
                            <button
                              key={l.id}
                              onClick={() => setSelectedLandlordId(l.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-label-md transition-all ${
                                selectedLandlordId === l.id
                                  ? "bg-brand-500 text-white shadow-md"
                                  : "bg-surface-container-high text-ink-muted hover:text-ink hover:bg-surface-container-highest"
                              }`}
                            >
                              <span>{l.name} {l.lastname}</span>
                              <span className="text-outline text-[10px]">({l.properties.length})</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedLandlord && (
                        <>
                          <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {(selectedLandlord.name || "").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-headline font-semibold text-ink">
                                {selectedLandlord.name} {selectedLandlord.lastname}
                              </p>
                              <p className="text-sm text-ink-muted">{selectedLandlord.email}</p>
                              {selectedLandlord.phone && (
                                <p className="text-sm text-ink-muted">{selectedLandlord.phone}</p>
                              )}
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {selectedLandlord.properties.map((p, i) => (
                                  <span key={i} className="text-[11px] bg-surface-container-high text-ink-muted px-2 py-0.5 rounded-full truncate max-w-[200px]">
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="bg-surface-container-low rounded-xl overflow-hidden" key={selectedLandlord.id}>
                            <ChatComponent emisor_id={userId} receptor_id={selectedLandlord.id} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "visitas" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-headline text-headline-md text-ink mb-1">Visitas</h2>
                    <p className="text-body-md text-ink-muted">Agenda una visita o revisa el estado de tus solicitudes</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="font-headline text-headline-sm text-ink flex items-center gap-2">
                        <span className="material-symbols-outlined text-brand-500 text-lg">add_circle</span>
                        Agendar nueva visita
                      </h3>
                      {activeContracts.length === 0 ? (
                        <div className="text-center py-8 bg-paper-card rounded-xl border border-line/50">
                          <span className="material-symbols-outlined text-3xl text-outline mb-2">home_work</span>
                          <p className="text-body-md text-ink-muted">No tienes propiedades activas para agendar visitas</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeContracts.map((contract) => (
                            <VisitScheduler
                              key={contract.agreement_id}
                              landlord_id={contract.landlord_id}
                              property_id={contract.property_id || contract.id_apt}
                              propertyAddress={`${contract.barrio_name || contract.barrio || ''} - ${contract.direccion_apt || ''}`}
                              onScheduled={() => {
                                fetchContracts();
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <TenantVisits />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "documentos" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-headline text-headline-md text-ink mb-1">Documentos</h2>
                    <p className="text-body-md text-ink-muted">Contratos y recibos de arriendo</p>
                  </div>

                  {loadingContracts ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    </div>
                  ) : contracts.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-outline mb-4">folder_open</span>
                      <p className="text-ink-muted">No tienes documentos disponibles</p>
                      <p className="text-sm text-outline mt-1">Los contratos y recibos aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contracts.map((contract) => (
                        <div
                          key={contract.agreement_id}
                          className="bg-paper-card border border-line/50 rounded-xl overflow-hidden"
                        >
                          <ContractSigner
                            contract={contract}
                            onSigned={() => fetchContracts()}
                          />

                          <div className="p-4 border-t border-line/50 flex items-center gap-3">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-label-md hover:bg-brand-600 transition-all">
                              <span className="material-symbols-outlined text-xs">download</span>
                              Contrato
                            </button>
                            <button
                              onClick={() => {
                                const payment = getContractPayment(contract.agreement_id);
                                if (payment) {
                                  downloadReceipt(payment.payment_id);
                                } else {
                                  setSelectedPaymentContract(contract);
                                  setShowPaymentModal(true);
                                }
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-ink text-label-md hover:bg-surface-container-highest transition-all"
                            >
                              <span className="material-symbols-outlined text-xs">
                                {getContractPayment(contract.agreement_id) ? 'download' : 'payments'}
                              </span>
                              {getContractPayment(contract.agreement_id) ? 'Recibo' : 'Pagar'}
                            </button>
                            {contract.status === 'active' && contract.status !== 'signed' && (
                              <span className="text-label-md text-secondary ml-auto flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">info</span>
                                Este contrato está pendiente de firma
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Stat cards — columna derecha */}
          <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
            {statCards.map((card, i) => (
              <div key={i} className="bg-paper-card rounded-xl p-4 border border-line/50">
                {card.type === "days" ? (
                  <div className="flex flex-col items-center">
                    {(() => {
                      const pct = card.circleValue;
                      const r = 60;
                      const cx = 80;
                      const cy = 78;
                      const angle = Math.PI * (1 - pct / 100);
                      const endX = cx + r * Math.cos(angle);
                      const endY = cy - r * Math.sin(angle);
                      const largeArc = pct > 50 ? 1 : 0;
                      return (
                        <svg width="100%" viewBox="0 0 160 92" className="overflow-visible">
                          <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke="currentColor" strokeWidth="10" className="text-line/30" strokeLinecap="round" />
                          <path d={`M ${cx - r},${cy} A ${r},${r} 0 ${largeArc},1 ${endX},${endY}`} fill="none" stroke="currentColor" strokeWidth="10" className="text-brand-500" strokeLinecap="round" />
                          <text x={cx} y={cy - 16} textAnchor="middle" fill="currentColor" className="text-ink font-headline font-bold" fontSize="28">{card.value}</text>
                          <text x={cx} y={cy + 2} textAnchor="middle" fill="currentColor" className="text-ink-muted" fontSize="10" letterSpacing="0.2em">DÍAS</text>
                        </svg>
                      );
                    })()}
                    <p className="text-label-sm text-ink-muted text-center">{card.label}</p>
                  </div>
                ) : card.type === "contracts" ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-headline text-headline-lg font-bold text-ink">{activeContracts.length}</p>
                    <p className="text-label-sm text-ink-muted text-center">{card.label}</p>
                  </div>
                ) : card.type === "payments" ? (
                  <div className="flex flex-col items-center">
                    <div className="w-full border-2 border-dashed border-line/30 rounded-lg p-3 text-center">
                      <p className="font-headline text-headline-lg font-bold text-ink leading-none">{formatPrice(totalMonthlyRent)}</p>
                      <p className="text-label-sm text-ink-muted mt-1">
                        {daysToNearestEnd !== null && daysToNearestEnd > 0
                          ? `Próximo: ${new Date(Date.now() + daysToNearestEnd * 86400000).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`
                          : "Sin contratos activos"}
                      </p>
                    </div>
                    <p className="text-label-sm text-ink-muted text-center mt-2">{card.label}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-headline text-headline-lg font-bold text-ink">{pendingReports.length}</p>
                    <p className="text-label-sm text-ink-muted text-center">{card.label}</p>
                  </div>
                )}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  </div>
  {showReportModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowReportModal(false)}>
      <div className="bg-paper-card rounded-xl shadow-ambient-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h2 className="font-headline text-headline-md text-ink">Nuevo Reporte de Mantenimiento</h2>
          <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-line/30 transition-all">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <form className="p-5 space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          if (!reportForm.property_id || !reportForm.title) return;
          const formData = new FormData();
          formData.append("property_id", reportForm.property_id);
          formData.append("title", reportForm.title);
          formData.append("description", reportForm.description);
          formData.append("priority", reportForm.priority);
          if (reportImage) formData.append("image", reportImage);
          setReportSubmitting(true);
          try {
            const res = await createMaintenanceReport(formData);
            if (res.success) {
              setShowReportModal(false);
              setReportForm({ property_id: "", title: "", description: "", priority: "medium" });
              setReportImage(null);
              fetchReports();
            }
          } catch (err) {
            console.error("Error creating report:", err);
          } finally {
            setReportSubmitting(false);
          }
        }}>
          <div>
            <label className="text-label-md text-ink-muted uppercase tracking-wider mb-1.5 block">Propiedad</label>
            <select name="property_id" value={reportForm.property_id} onChange={(e) => setReportForm((p) => ({ ...p, property_id: e.target.value }))} required
              className={`w-full px-3 py-2.5 rounded-lg bg-paper-sunk border border-line text-body-md focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all ${reportForm.property_id ? "text-ink" : "text-ink-muted"}`}>
              <option value="" className="text-ink-muted">{reportProperties.length === 0 ? "Cargando..." : "Seleccioná una propiedad"}</option>
              {reportProperties.map((p) => (
                <option key={p.id_apt} value={p.id_apt}>{p.direccion_apt} - {p.barrio}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-md text-ink-muted uppercase tracking-wider mb-1.5 block">Título</label>
            <input name="title" value={reportForm.title} onChange={(e) => setReportForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ej: Fuga de agua" required
              className="w-full px-3 py-2.5 rounded-lg bg-paper-sunk border border-line text-ink text-body-md placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" />
          </div>
          <div>
            <label className="text-label-md text-ink-muted uppercase tracking-wider mb-1.5 block">Descripción</label>
            <textarea name="description" value={reportForm.description} onChange={(e) => setReportForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describí el problema..."
              className="w-full px-3 py-2.5 rounded-lg bg-paper-sunk border border-line text-ink text-body-md placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all resize-vertical" />
          </div>
          <div>
            <label className="text-label-md text-ink-muted uppercase tracking-wider mb-1.5 block">Prioridad</label>
            <div className="flex gap-2">
              {[
                { value: "low", label: "Baja", cls: "bg-outline/15 text-outline border border-outline/30" },
                { value: "medium", label: "Media", cls: "bg-secondary/15 text-secondary border border-secondary/30" },
                { value: "high", label: "Alta", cls: "bg-warning/15 text-warning border border-warning/30" },
                { value: "urgent", label: "Urgente", cls: "bg-error/15 text-error border border-error/30" },
              ].map((opt) => (
                <button key={opt.value} type="button" onClick={() => setReportForm((p) => ({ ...p, priority: opt.value }))}
                  className={`flex-1 px-3 py-2 rounded-lg text-label-md font-semibold transition-all ${
                    reportForm.priority === opt.value
                      ? opt.cls
                      : "bg-paper-sunk text-ink-muted hover:bg-line/30 border border-transparent"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-label-md text-ink-muted uppercase tracking-wider mb-1.5 block">Foto (opcional)</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) setReportImage(e.dataTransfer.files[0]); }}
              className={`relative w-full rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                isDragging
                  ? "border-brand-500 bg-brand-500/10"
                  : reportImage
                    ? "border-tertiary/30 bg-tertiary/5"
                    : "border-line bg-paper-sunk hover:bg-line/20"
              }`}
            >
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) setReportImage(e.target.files[0]); }} id="report-image"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
              {reportImage ? (
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-tertiary">check_circle</span>
                    <span className="text-body-md text-ink truncate max-w-[200px]">{reportImage.name}</span>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setReportImage(null); document.getElementById("report-image").value = ""; }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted hover:text-error hover:bg-error/10 transition-all">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-5 px-3">
                  <span className={`material-symbols-outlined text-2xl mb-1 ${isDragging ? "text-brand-500" : "text-outline"}`}>
                    {isDragging ? "cloud_upload" : "add_photo_alternate"}
                  </span>
                  <p className={`text-body-md mb-0.5 ${isDragging ? "text-brand-500 font-medium" : "text-ink-muted"}`}>
                    {isDragging ? "Soltá la imagen acá" : "Agregar imagen"}
                  </p>
                  <p className="text-label-sm text-ink-muted">o arrastrá y soltá</p>
                </div>
              )}
            </div>
          </div>
          <button type="submit" disabled={reportSubmitting}
            className="w-full py-3 rounded-lg bg-brand-500 text-white font-headline font-bold text-label-md hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {reportSubmitting ? "Enviando..." : "Enviar Reporte"}
          </button>
        </form>
      </div>
    </div>
  )}
  {showPaymentModal && selectedPaymentContract && (
        stripePromise ? (
          <Elements stripe={stripePromise}>
            <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID || '', currency: 'USD' }}>
              <PaymentModal
                contract={selectedPaymentContract}
                onClose={() => { setShowPaymentModal(false); setSelectedPaymentContract(null); }}
                onSuccess={() => { fetchPayments(); fetchContracts(); }}
              />
            </PayPalScriptProvider>
          </Elements>
        ) : (
          <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID || '', currency: 'USD' }}>
            <PaymentModal
              contract={selectedPaymentContract}
              onClose={() => { setShowPaymentModal(false); setSelectedPaymentContract(null); }}
              onSuccess={() => { fetchPayments(); fetchContracts(); }}
            />
          </PayPalScriptProvider>
        )
      )}
    </div>
  );
}

export default TenantDashboard;
