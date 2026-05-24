import React, { useState, useEffect, useContext, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import axiosInstance from "../contexts/axiosInstance";
import ApartmentForm from "../components/ApartmentForm";
import Manage from '../components/Manage';
import ContractManager from '../components/ContractManager';
import LandlordReviews from '../components/LandlordReviews';
import Toast from '../components/Toast';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'list';
  const [showForm, setShowForm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [stats, setStats] = useState({ totalProps: 0, activeProps: 0, activeContracts: 0, totalIncome: 0, incomeSeries: [], payments: [], contracts: [], approvedCount: 0, pendingCount: 0, reviews: [] });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [aptRes, contractRes, paymentsRes, reviewsRes] = await Promise.allSettled([
        axiosInstance.get('/apartments/manage'),
        axiosInstance.get('/contracts/landlord/contracts'),
        axiosInstance.get('/payments/history'),
        axiosInstance.get('/reviews/landlord/my-reviews')
      ]);

      const apartments = aptRes.value?.data || [];
      const contracts = contractRes.value?.data || [];
      const payments = Array.isArray(paymentsRes.value?.data) ? paymentsRes.value.data : [];
      const reviewsData = reviewsRes.value?.data?.reviews || [];
      const reviews = Array.isArray(reviewsData) ? reviewsData : [];

      const totalProps = Array.isArray(apartments) ? apartments.length : 0;
      const activeProps = Array.isArray(apartments)
        ? apartments.filter(a => a.status === 'available').length : 0;
      const approvedCount = Array.isArray(apartments)
        ? apartments.filter(a => a.publication_status === 'approved').length : 0;
      const pendingCount = Array.isArray(apartments)
        ? apartments.filter(a => a.publication_status === 'pending').length : 0;
      const activeContracts = Array.isArray(contracts)
        ? contracts.filter(c => c.status === 'active').length : 0;
      const totalIncome = Array.isArray(contracts)
        ? contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.monthly_rent || 0), 0) : 0;

      // Build income series for the sparkline
      let incomeSeries;
      const activeOnes = (Array.isArray(contracts) ? contracts : [])
        .filter(c => c.status === 'active' && c.monthly_rent);
      const activeIncome = activeOnes.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);
      const avgRent = activeOnes.length > 0 ? Math.round(activeIncome / activeOnes.length) : 0;

      if (activeOnes.length >= 2 && avgRent > 0) {
        // Stair-step distribuido en 12 meses — como el prototipo
        const stepDuration = Math.max(1, Math.floor(12 / activeOnes.length));
        incomeSeries = Array.from({ length: 12 }, (_, i) => {
          const stepIndex = Math.min(activeOnes.length - 1, Math.floor(i / stepDuration));
          return (stepIndex + 1) * avgRent;
        });
      } else {
        // Curva suave creciente — para 0 o 1 contrato
        const target = Math.max(activeIncome || 4000000, 2000000);
        incomeSeries = Array.from({ length: 12 }, (_, i) => {
          const progress = (i + 1) / 12;
          const factor = Math.min(1, progress * 1.2 + progress * progress * 0.3);
          return Math.round(target * factor);
        });
      }

      setStats({ totalProps, activeProps, approvedCount, pendingCount, activeContracts, totalIncome, incomeSeries, payments, contracts, reviews });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  const handleApartmentAdded = () => {
    setShowSuccessToast(true);
    setShowForm(false);
    navigate('/dashboard');
    fetchStats();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);
  };

  // Daily income from real active contracts (últimos 7 días)
  // Active apartment count per day (últimos 7 días)
  const revenueData = useMemo(() => {
    const days = [];
    const today = new Date();
    const contracts = stats.contracts || [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const name = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      days.push({ name, value: 0 });
    }

    let hasData = false;
    days.forEach((d, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));

      const createdOnDay = contracts.filter(c => {
        if (!c.start_date) return false;
        const start = new Date(c.start_date);
        if (isNaN(start.getTime())) return false;
        return start.toDateString() === date.toDateString();
      });

      d.value = createdOnDay.length;
      if (createdOnDay.length > 0) hasData = true;
    });

    if (!hasData) {
      days.forEach((d) => { d.value = 0; });
    }

    return days;
  }, [stats.contracts, stats.activeContracts]);

  const firstName = (user?.nombre || '').split(' ')[0] || '';
  const initials = `${(user?.nombre || '').charAt(0)}${(user?.apellido || '').charAt(0)}`.toUpperCase();

  return showForm ? (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <ApartmentForm onSuccess={handleApartmentAdded} onClose={() => setShowForm(false)} />
    </div>

  ) : showReviews ? (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <LandlordReviews onClose={() => setShowReviews(false)} />
    </div>

  ) : (
    <div className="min-h-screen bg-paper">
      {/* Main content — full width (no sidebar) */}
      <div className="px-6 py-6">
            {activeTab === 'list' && (
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-muted font-medium mb-2">Tu portafolio</div>
                  <h1 className="font-display text-5xl leading-none mb-2">Bien hecho, <span className="italic-serif text-brand-500">{firstName}.</span></h1>
                  <p className="text-label-md text-ink-muted">Mayo 2026 · {stats.activeProps} {stats.activeProps === 1 ? 'propiedad activa' : 'propiedades activas'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-label-md font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Publicar propiedad
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-label-md font-medium bg-paper-sunk border border-line text-ink-muted hover:text-ink hover:bg-line/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">summarize</span>
                    Reporte mensual
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* KPI row — prototype style */}
            {activeTab === 'list' && (
            <div className="grid grid-cols-12 gap-4 mb-8">
              {/* Income card — dark bg with sparkline */}
              <div className="col-span-12 lg:col-span-5 rcard p-6 bg-ink text-paper relative overflow-hidden" style={{ '--card-bg': '#0e1a2b', '--card-border': '1px solid transparent' }}>
                <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-brand-500 opacity-20 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wider text-paper/60 font-medium">Contratos Creados</div>
                    <span className="text-xs text-moss bg-moss/10 px-2 py-0.5 rounded-full">últimos 7 días</span>
                  </div>
                  <div className="font-display text-5xl mt-3">
                    {revenueData[revenueData.length - 1]?.value ?? 0}
                  </div>
                  <div className="text-xs text-paper/60 mt-1">contratos nuevos hoy</div>
                  {/* AreaChart — contratos creados por día */}
                  <div className="mt-4" style={{ height: '130px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#5b86b8" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#5b86b8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.08} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ffffff', fillOpacity: 0.5 }} />
                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} domain={[0, 'auto']} tick={{ fontSize: 10, fill: '#ffffff', fillOpacity: 0.5 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#1F2937', color: '#F9FAFB', fontSize: '12px' }}
                          formatter={(value) => [`${value} ${value === 1 ? 'contrato' : 'contratos'}`]}
                        />
                        <Area type="monotone" dataKey="value" stroke="#5b86b8" strokeWidth={2} fill="url(#incomeGradient)" dot={{ fill: '#5b86b8', r: 3, stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Mini stat cards */}
              <div className="col-span-12 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">

                {/* Ocupación — Donut compacto */}
                <div className="rcard p-5">
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">Ocupación</div>
                  <div className="flex items-center justify-center" style={{ height: '120px' }}>
                    <ResponsiveContainer width="60%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Disponibles', value: stats.activeProps, fill: '#10B981' },
                            { name: 'Ocupadas', value: Math.max(0, stats.totalProps - stats.activeProps), fill: '#E5E7EB' },
                          ]}
                          cx="50%" cy="50%"
                          innerRadius={30}
                          outerRadius={48}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell key="available" fill="#10B981" />
                          <Cell key="occupied" fill="#E5E7EB" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center flex-shrink-0">
                      <div className="font-display text-2xl text-ink">
                        {stats.totalProps > 0 ? Math.round((stats.activeProps / stats.totalProps) * 100) : 0}
                        <span className="text-sm text-ink-muted">%</span>
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">{stats.activeProps} disp.</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs text-ink-muted">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> {stats.activeProps} libres</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E5E7EB]" /> {stats.totalProps - stats.activeProps} ocupadas</span>
                  </div>
                </div>

                {/* Ingreso Promedio */}
                <div className="rcard p-5">
                  <span className="material-symbols-outlined text-lg text-brand-500 mb-1 block">payments</span>
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">Ingreso Promedio</div>
                  <div className="font-display text-2xl mt-1 text-brand-500">
                    {stats.activeContracts > 0
                      ? Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Math.round(stats.totalIncome / stats.activeContracts))
                      : '$ 0'}
                  </div>
                  <div className="text-xs text-ink-muted mt-1">por contrato</div>
                </div>

                {/* Propiedades Totales */}
                <div className="rcard p-5">
                  <span className="material-symbols-outlined text-lg text-brand-500 mb-1 block">apartment</span>
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">Propiedades</div>
                  <div className="font-display text-4xl mt-1">{stats.totalProps}</div>
                  <div className="text-xs text-ink-muted mt-1">{stats.activeProps} activas</div>
                </div>

                {/* Contratos Vigentes */}
                <div className="rcard p-5">
                  <span className="material-symbols-outlined text-lg text-brand-500 mb-1 block">description</span>
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">Contratos</div>
                  <div className="font-display text-4xl mt-1">{stats.activeContracts}</div>
                  <div className="text-xs text-moss mt-1">vigentes</div>
                </div>

                {/* Aprobadas */}
                <div className="rcard p-5">
                  <span className="material-symbols-outlined text-lg text-tertiary mb-1 block">check_circle</span>
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">Aprobadas</div>
                  <div className="font-display text-4xl mt-1 text-tertiary">{stats.approvedCount}</div>
                  <div className="text-xs text-ink-muted mt-1">publicaciones</div>
                </div>

                {/* En Revisión */}
                <div className="rcard p-5">
                  <span className="material-symbols-outlined text-lg text-secondary mb-1 block">pending</span>
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">En Revisión</div>
                  <div className="font-display text-4xl mt-1 text-secondary">{stats.pendingCount}</div>
                  <div className="text-xs text-ink-muted mt-1">pendientes</div>
                </div>
              </div>

            </div>
            )}

            {/* Content area */}

            {/* Content area */}
            <div className="space-y-4 pt-2">
              {activeTab === 'list' && (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7">
                  <Manage totalIncome={stats.totalIncome} activeProps={stats.activeProps} activeContracts={stats.activeContracts} />
                </div>

                {/* Activity section — prototype style */}
                <div className="col-span-12 lg:col-span-5">
                  <div className="rcard p-6">
                    <h3 className="font-display text-2xl text-ink mb-4">Actividad</h3>
                    <div className="space-y-4">
                      {/* Stats summary */}
                      <div className="flex gap-3 items-start">
                        <div className="w-9 h-9 rounded-full bg-moss-soft text-moss flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">wallet</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-ink">Ingreso mensual proyectado</div>
                          <div className="text-xs text-ink-muted">{stats.activeContracts} {stats.activeContracts === 1 ? 'contrato activo' : 'contratos activos'}</div>
                        </div>
                        <div className="text-sm font-display text-ink">
                          {Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stats.totalIncome || 0)}
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">apartment</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-ink">Propiedades publicadas</div>
                          <div className="text-xs text-ink-muted">{stats.activeProps} disponibles · {stats.totalProps - stats.activeProps} no disponibles</div>
                        </div>
                        <div className="text-sm font-display text-ink">{stats.totalProps}</div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-9 h-9 rounded-full bg-paper-sunk text-ink-muted flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">description</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-ink">Contratos vigentes</div>
                          <div className="text-xs text-ink-muted">{stats.activeContracts} {stats.activeContracts === 1 ? 'contrato activo' : 'contratos activos'}</div>
                        </div>
                        <div className="text-sm font-display text-ink">{stats.activeContracts}</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <hr className="border-line my-4" />

                  {/* Reseñas */}
                  <h4 className="font-display text-lg text-ink mb-3">Reseñas</h4>
                  <div className="space-y-3">
                    {stats.reviews.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">star</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-ink">{r.reviewer_name || r.tenant_name || 'Anónimo'}</div>
                          <div className="text-xs text-ink-muted">"{(r.comment || '').substring(0, 60)}"</div>
                        </div>
                        <div className="text-sm font-display text-amber-600">★ {r.rating || '-'}</div>
                      </div>
                    ))}
                    {stats.reviews.length === 0 && (
                      <div className="text-sm text-ink-muted text-center py-4">Sin reseñas aún</div>
                    )}
                  </div>

                  <button onClick={() => setShowReviews(true)} className="mt-3 text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition-colors">
                    Ver más reseñas
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
                </div>
              </div>
              )}
              {activeTab === 'contracts' && <ContractManager />}
            </div>
          </div>

      {showSuccessToast && (
        <Toast message="Apartamento creado exitosamente" type="success" onClose={() => setShowSuccessToast(false)} />
      )}
    </div>
  );
}

export default Dashboard;
