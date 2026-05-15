import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import axiosInstance from "../contexts/axiosInstance";
import ApartmentForm from "../components/ApartmentForm";
import Manage from '../components/Manage';
import ContractManager from '../components/ContractManager';
import LandlordReviews from '../components/LandlordReviews';
import Toast from '../components/Toast';

function Dashboard() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('list');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [stats, setStats] = useState({ totalProps: 0, activeProps: 0, activeContracts: 0, totalIncome: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    { id: 'reviews', label: 'Reseñas', icon: 'star' },
  ];

  const statCards = [
    { label: 'Total Propiedades', value: stats.totalProps, icon: 'apartment', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Propiedades Activas', value: stats.activeProps, icon: 'check_circle', color: 'text-tertiary', bg: 'bg-tertiary/10' },
    { label: 'Contratos Vigentes', value: stats.activeContracts, icon: 'description', color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Total Mensual', value: formatPrice(stats.totalIncome), icon: 'payments', color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const firstName = (user?.nombre || '').split(' ')[0] || '';
  const initials = `${(user?.nombre || '').charAt(0)}${(user?.apellido || '').charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-surface-container-low border-r border-surface-container transition-all duration-300 z-30 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
          <div className="flex flex-col h-full p-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="self-end p-1.5 rounded-lg text-outline hover:text-on-surface-variant hover:bg-surface-container-high transition-all mb-4"
            >
              <span className="material-symbols-outlined text-sm">{sidebarCollapsed ? 'menu_open' : 'menu'}</span>
            </button>

            <nav className="flex-1 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="material-symbols-outlined text-lg flex-shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && <span className="text-label-md font-medium truncate">{item.label}</span>}
                </button>
              ))}
            </nav>

            {/* User info at bottom */}
            {!sidebarCollapsed && (
              <div className="pt-3 mt-3 border-t border-surface-container-high">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-label-md font-bold flex-shrink-0">
                    {initials || '?'}
                  </div>
                  <div className="truncate">
                    <p className="text-label-md font-medium text-on-surface truncate">{firstName || 'Usuario'}</p>
                    <p className="text-label-md text-outline uppercase tracking-wider">ARRENDADOR</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
          <div className="max-w-6xl mx-auto px-6 py-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-headline text-headline-lg text-on-primary mb-1">Bienvenido de nuevo, {firstName}</h1>
                  <p className="text-on-primary/80 text-body-md">Este es el resumen general de tu portafolio inmobiliario.</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-white/20 text-on-primary text-label-md font-medium hover:bg-white/30 transition-all flex items-center gap-2 backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-sm">summarize</span>
                  Generar Reporte
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statCards.map((card, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-lg ${card.color}`}>{card.icon}</span>
                    </div>
                    <div>
                      <p className="text-label-md uppercase tracking-wider text-outline">{card.label}</p>
                      <p className={`font-headline text-headline-md font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content area */}
            <div className="bg-surface-container-lowest rounded-xl shadow-ambient-sm">
              {activeTab === 'list' && <Manage />}
              {activeTab === 'add' && <ApartmentForm onSuccess={handleApartmentAdded} />}
              {activeTab === 'contracts' && <ContractManager />}
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
