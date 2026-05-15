import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react";
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
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
import './App.css';

function AppContent() {
  const [showJoin, setShowJoin] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
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

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/role-selection' element={<RoleSelection />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
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
          path='/admin/apartments' 
          element={
            <ProtectedRoute requiredRole={3} fallbackPath="/">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/map' element={<Map />} />
        <Route path='/listings' element={
          <div className="pt-20 min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="font-headline text-headline-lg text-on-surface mb-8">Todas las Propiedades</h1>
              <ApartmentList />
            </div>
          </div>
        } />
      </Routes>
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


