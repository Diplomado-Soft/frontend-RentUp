import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react";
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Account from './components/Account';
import Join from './components/Join';
import Toast from './components/Toast';
import ProtectedRoute from './contexts/ProtectedRoute';
import RoleSelection from './pages/RoleSelection';
import MyAccount from './pages/My-Account';
import GitHubCallback from './pages/GitHubCallback';
import AdminDashboard from './components/AdminDashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Map from './components/Map';
import ApartmentList from './components/ApartmentList';
import Billing from './components/My-Account/Billing';
import MyRents from './components/My-Account/MyRents';
import TenantMaintenance from './components/TenantMaintenance';
import LandlordMaintenance from './components/LandlordMaintenance';
import TenantDashboard from './pages/TenantDashboard';
import './App.css';

function ListingsPage({ goToJoin, listingSearch, setListingSearch, listingFilters }) {
  const [searchParams] = useSearchParams();
  const urlQ = searchParams.get('q') || '';

  // Si hay ?q= en la URL, sincronizar con listingSearch al montar
  useEffect(() => {
    if (urlQ && urlQ !== listingSearch) {
      setListingSearch(urlQ);
    }
  }, []); // solo al montar

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="font-display text-3xl text-ink mb-8">
          {listingSearch ? `Resultados para "${listingSearch}"` : 'Todas las Propiedades'}
        </h1>
        <ApartmentList searchTerm={listingSearch} filters={listingFilters} goToJoin={goToJoin} />
      </div>
    </div>
  );
}

function FacturacionPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Billing />
      </div>
    </div>
  );
}

function MyRentsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MyRents />
      </div>
    </div>
  );
}

function AppContent() {
  const [showJoin, setShowJoin] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [listingSearch, setListingSearch] = useState('');
  const [listingFilters, setListingFilters] = useState({
    priceMin: '', priceMax: '', bedrooms: [], bathrooms: [], amenities: []
  });
  const [navbarHeight, setNavbarHeight] = useState(56);
  const location = useLocation();

  const toggleJoin = () => setShowJoin(prev => !prev);
  const toggleAccount = () => setShowAccount(prev => !prev);
  const handleLogoutSuccess = () => {
    setShowAccount(false);
    setShowLogoutToast(true);
  };

  useEffect(() => {
    setShowAccount(false);
    setShowJoin(false);
    if (location.pathname !== '/listings') {
      setListingFilters({ priceMin: '', priceMax: '', bedrooms: [], bathrooms: [], amenities: [] });
    }
  }, [location.pathname]);

  const isAuthPage = ['/signup', '/login', '/role-selection', '/auth/callback'].includes(location.pathname);

  return (
    <>
      <SpeedInsights />

      {!isAuthPage && (
        <Navbar 
          goToJoin={toggleJoin}
          showAccount={showAccount}
          setShowAccount={toggleAccount}
          listingSearch={listingSearch}
          setListingSearch={setListingSearch}
          listingFilters={listingFilters}
          setListingFilters={setListingFilters}
          onHeightChange={setNavbarHeight}
        />
      )}

      {showJoin && <Join onClose={toggleJoin} />}
      {showAccount && <Account onClose={toggleAccount} onLogoutSuccess={handleLogoutSuccess} />}
      
      {showLogoutToast && (
        <Toast 
          message="Sesión cerrada exitosamente" 
          type="success" 
          onClose={() => setShowLogoutToast(false)} 
        />
      )}

      <div style={{ paddingTop: isAuthPage ? 0 : (location.pathname === '/listings' ? navbarHeight : 56) }}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/role-selection' element={<RoleSelection />} />
          <Route path='/signup' element={<AuthPage />} />
          <Route path='/login' element={<AuthPage />} />
          <Route path='/auth/callback' element={<GitHubCallback />} />
          <Route 
            path='/dashboard' 
            element={
              <ProtectedRoute requiredRole={2} fallbackPath="/">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/my-account' 
            element={
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/mis-reportes' 
            element={
              <ProtectedRoute requiredRole={1} fallbackPath="/"><TenantMaintenance /></ProtectedRoute>
            } 
          />
          <Route 
            path='/mi-espacio' 
            element={
              <ProtectedRoute requiredRole={1} fallbackPath="/">
                <TenantDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/map' element={<Map />} />
          <Route path='/listings' element={<ListingsPage goToJoin={toggleJoin} listingSearch={listingSearch} setListingSearch={setListingSearch} listingFilters={listingFilters} />} />
          <Route path='/facturacion' element={<ProtectedRoute><FacturacionPage /></ProtectedRoute>} />
          <Route path='/mis-arriendos' element={<ProtectedRoute><MyRentsPage /></ProtectedRoute>} />
          <Route path='/mantenimiento-panel' element={<ProtectedRoute requiredRole={2} fallbackPath="/"><LandlordMaintenance /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;


