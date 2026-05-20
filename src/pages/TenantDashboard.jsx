import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import axiosInstance from "../contexts/axiosInstance";
import ChatComponent from "../components/ChatComponent";
import { getMyReports } from "../apis/maintenanceController";

function TenantDashboard() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("mis-arriendos");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [contracts, setContracts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);

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

  useEffect(() => {
    fetchContracts();
    fetchReports();
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
    { id: "documentos", label: "Documentos", icon: "description" },
  ];

  const statCards = [
    {
      label: "Contratos Activos",
      value: activeContracts.length,
      icon: "description",
      color: "text-brand-500",
      bg: "bg-brand-500/10",
    },
    {
      label: "Pagos Mensuales",
      value: formatPrice(totalMonthlyRent),
      icon: "payments",
      color: "text-moss",
      bg: "bg-moss/10",
    },
    {
      label: "Reportes Pendientes",
      value: pendingReports.length,
      icon: "build",
      color: activeContracts.length > 0 ? "text-ember" : "text-outline",
      bg: "bg-ember/10",
    },
    {
      label: daysToNearestEnd !== null && daysToNearestEnd > 0 ? "Días Restantes" : "Sin contrato activo",
      value: daysToNearestEnd !== null && daysToNearestEnd > 0 ? daysToNearestEnd : "-",
      icon: "schedule",
      color: daysToNearestEnd !== null && daysToNearestEnd <= 30 ? "text-error" : "text-tertiary",
      bg: "bg-brand-100/20",
    },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <div className="flex">
        <aside
          className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-paper-sunk border-r border-line transition-all duration-300 z-30 ${
            sidebarCollapsed ? "w-16" : "w-60"
          }`}
        >
          <div className="flex flex-col h-full p-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="self-end p-1.5 rounded-lg text-ink-muted hover:text-ink-muted hover:bg-line/30 transition-all mb-4"
            >
              <span className="material-symbols-outlined text-sm">{sidebarCollapsed ? "menu_open" : "menu"}</span>
            </button>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-brand-500 text-white shadow-md"
                      : "text-ink-muted hover:text-ink hover:bg-line/30"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="material-symbols-outlined text-lg flex-shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && <span className="text-label-md font-medium truncate">{item.label}</span>}
                </button>
              ))}
            </nav>

            {!sidebarCollapsed && (
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
            )}
          </div>
        </aside>

        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-60"}`}>
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-headline text-headline-lg text-white mb-1">
                    Bienvenido a tu espacio, {firstName}
                  </h1>
                  <p className="text-white/80 text-body-md">
                    Aquí puedes gestionar tus arriendos, pagos y más.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statCards.map((card, i) => (
                <div key={i} className="bg-paper-sunkest rounded-xl p-4 shadow-ambient-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-lg ${card.color}`}>{card.icon}</span>
                    </div>
                    <div>
                      <p className="text-label-md uppercase tracking-wider text-ink-muted">{card.label}</p>
                      <p className={`font-headline text-headline-md font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-paper-sunkest rounded-xl shadow-ambient-sm">
              {activeTab === "mis-arriendos" && (
                <div className="p-6 space-y-6">
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
                          <div key={rent.agreement_id} className="bg-surface-container-low rounded-xl overflow-hidden">
                            <div className="p-5">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-3">
                                <div className="w-full sm:w-36 h-24 bg-surface-container-high rounded-lg overflow-hidden flex-shrink-0">
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
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <h3 className="font-headline text-headline-md text-ink truncate">
                                        {rent.barrio_name || rent.barrio || "Sin barrio"}
                                      </h3>
                                      <p className="text-body-md text-ink-muted truncate">{rent.direccion_apt || ""}</p>
                                    </div>
                                    {getStatusBadge(rent.status)}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-ink-muted">
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                                      Inicio: {formatDate(rent.start_date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">event</span>
                                      Fin: {formatDate(rent.end_date)}
                                    </span>
                                    {daysRemaining !== null && daysRemaining > 0 && (
                                      <span
                                        className={`flex items-center gap-1 ${
                                          daysRemaining <= 30 ? "text-error" : "text-tertiary"
                                        }`}
                                      >
                                        <span className="material-symbols-outlined text-xs">schedule</span>
                                        {daysRemaining} días restantes
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    <span className="font-bold text-headline-md text-primary">
                                      {formatPrice(rent.monthly_rent)}
                                    </span>
                                    <span className="text-ink-muted text-sm"> /mes</span>
                                  </div>
                                  {rent.landlord_name && (
                                    <p className="text-sm text-ink-muted mt-1">
                                      Arrendador: {rent.landlord_name} {rent.landlord_lastname || ""}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {pastContracts.length > 0 && (
                        <div>
                          <h3 className="font-headline text-headline-md text-ink mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-outline rounded-full"></span>
                            Arriendos Anteriores
                          </h3>
                          <div className="space-y-3">
                            {pastContracts.map((rent) => (
                              <div
                                key={rent.agreement_id}
                                className="bg-surface-container-low rounded-xl p-4 opacity-70"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h4 className="font-semibold text-ink truncate">
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
                                    <p className="font-semibold text-ink">{formatPrice(rent.monthly_rent)}</p>
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
                <div className="p-6 space-y-6">
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
                                    <p className="font-semibold text-ink truncate">
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
                                  <p className="font-bold text-ink">{formatPrice(contract.monthly_rent)}</p>
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
                                <button className="flex items-center gap-1 text-label-md text-primary hover:underline transition-all">
                                  <span className="material-symbols-outlined text-xs">download</span>
                                  Recibo
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
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-headline text-headline-md text-ink mb-1">Mis Reportes de Mantenimiento</h2>
                      <p className="text-body-md text-ink-muted">
                        {reports.length} reporte{reports.length !== 1 ? "s" : ""} realizado
                        {reports.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => window.open("/mis-reportes", "_self")}
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
                    <div className="space-y-3">
                      {reports.map((r) => (
                        <div
                          key={r.id}
                          className="bg-surface-container-low rounded-xl p-5 hover:bg-surface-container-high transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {r.image_url && (
                              <img
                                src={r.image_url}
                                alt="Reporte"
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-ink">{r.title}</h4>
                                  <p className="text-sm text-ink-muted mt-0.5">
                                    {r.direccion_apt} - {r.barrio}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
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
                              </div>
                              {r.description && (
                                <p className="text-sm text-ink-muted mt-2 line-clamp-2">{r.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted">
                                <span>
                                  {new Date(r.created_at).toLocaleDateString("es-CO", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                                {r.landlord_notes && (
                                  <span className="italic">· Nota: {r.landlord_notes}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "contacto" && (
                <div className="p-6 space-y-6">
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
                              <p className="font-semibold text-ink">
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

              {activeTab === "documentos" && (
                <div className="p-6 space-y-6">
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
                          className="bg-surface-container-low rounded-xl p-5 hover:bg-surface-container-high transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-sm text-brand-500">description</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-ink">
                                  Contrato de Arriendo —{" "}
                                  {contract.barrio_name || contract.barrio || "Sin barrio"}
                                </p>
                                <p className="text-xs text-ink-muted mt-0.5 truncate">
                                  {contract.direccion_apt || "Sin dirección"}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                                  <span>
                                    {formatDate(contract.start_date)} — {formatDate(contract.end_date)}
                                  </span>
                                  <span className="text-outline">·</span>
                                  {getStatusBadge(contract.status)}
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <p className="font-semibold text-ink text-right">{formatPrice(contract.monthly_rent)}</p>
                              <p className="text-xs text-ink-muted text-right">/mes</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-surface-container-high">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-label-md hover:bg-brand-600 transition-all">
                              <span className="material-symbols-outlined text-xs">download</span>
                              Contrato
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-ink text-label-md hover:bg-surface-container-highest transition-all">
                              <span className="material-symbols-outlined text-xs">download</span>
                              Recibo
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TenantDashboard;
