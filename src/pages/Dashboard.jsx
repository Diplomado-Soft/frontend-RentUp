import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import axiosInstance from "../contexts/axiosInstance";
import ApartmentForm from "../components/ApartmentForm";
import Manage from '../components/Manage';
import ContractManager from '../components/ContractManager';
import LandlordReviews from '../components/LandlordReviews';
import LandlordVisits from '../components/LandlordVisits';
import Toast from '../components/Toast';

function Dashboard() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('list');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [stats, setStats] = useState({ totalProps: 0, activeProps: 0, activeContracts: 0, totalIncome: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [aptRes, contractRes] = await Promise.allSettled([
        axiosInstance.get('/apartments/manage'),
        axiosInstance.get('/contracts/landlord/contracts')
      ]);

      const apartments = aptRes.value?.data || [];
      const contracts = contractRes.value?.data || [];

      const totalProps = Array.isArray(apartments) ? apartments.length : 0;
      const activeProps = Array.isArray(apartments)
        ? apartments.filter(a => a.status === 'available').length : 0;
      const activeContracts = Array.isArray(contracts)
        ? contracts.filter(c => c.status === 'active').length : 0;
      const totalIncome = Array.isArray(contracts)
        ? contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.monthly_rent || 0), 0) : 0;

      setStats({ totalProps, activeProps, activeContracts, totalIncome });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  const handleApartmentAdded = () => {
    setShowSuccessToast(true);
    setActiveTab('list');
    fetchStats();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);
  };

  const navItems = [
    { id: 'list', label: 'Mis Apartamentos', icon: 'domain' },
    { id: 'add', label: 'Añadir Propiedad', icon: 'add_business' },
    { id: 'contracts', label: 'Contratos', icon: 'description' },
    { id: 'visits', label: 'Visitas', icon: 'calendar_month' },
    { id: 'reviews', label: 'Reseñas', icon: 'star' },
  ];

  const statCards = [
    { label: 'Total Propiedades', value: stats.totalProps, icon: 'apartment', color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { label: 'Propiedades Activas', value: stats.activeProps, icon: 'check_circle', color: 'text-moss', bg: 'bg-moss/10' },
    { label: 'Contratos Vigentes', value: stats.activeContracts, icon: 'description', color: 'text-brand-400', bg: 'bg-brand-100/20' },
    { label: 'Total Mensual', value: formatPrice(stats.totalIncome), icon: 'payments', color: 'text-brand-500', bg: 'bg-brand-500/10' },
  ];

  const firstName = (user?.nombre || '').split(' ')[0] || '';
  const initials = `${(user?.nombre || '').charAt(0)}${(user?.apellido || '').charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-paper">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-60 bg-paper-sunk border-r border-line z-30">
          <div className="flex flex-col h-full p-3">
            <nav className="flex-1 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-brand-100 text-brand-700 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-line/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg flex-shrink-0">{item.icon}</span>
                  <span className="text-label-md font-medium truncate">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User info at bottom */}
            <div className="pt-3 mt-3 border-t border-line">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-label-md font-bold flex-shrink-0">
                  {initials || '?'}
                </div>
                <div className="truncate">
                  <p className="text-label-md font-medium text-ink truncate">{firstName || 'Usuario'}</p>
                  <p className="text-label-md text-ink-muted uppercase tracking-wider">ARRENDADOR</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 ml-60">
          <div className="px-6 py-6">
            {activeTab === 'list' && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-5xl md:text-7xl leading-none text-brand-500 mb-2">Bienvenido de nuevo, {firstName}</h1>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-label-md font-medium bg-paper-sunk border border-line text-ink-muted hover:text-ink hover:bg-line/30 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">summarize</span>
                  Generar Reporte
                </button>
              </div>
            </div>
            )}

            {/* Content area */}
            <div className="space-y-4 pt-2">
              {activeTab === 'list' && <Manage totalIncome={stats.totalIncome} activeProps={stats.activeProps} activeContracts={stats.activeContracts} />}
              {activeTab === 'add' && <ApartmentForm onSuccess={handleApartmentAdded} />}
              {activeTab === 'contracts' && <ContractManager />}
              {activeTab === 'visits' && <LandlordVisits />}
              {activeTab === 'reviews' && <LandlordReviews />}
            </div>
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <Toast message="Apartamento creado exitosamente" type="success" onClose={() => setShowSuccessToast(false)} />
      )}
    </div>
  );
}

export default Dashboard;
