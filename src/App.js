import React, { useState, useEffect } from 'react';
import { UserProvider } from './contexts/UserContext';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Account from './components/Account';
import ProtectedRoute from './contexts/ProtectedRoute';
import RoleSelection from './pages/RoleSelection';
import MyAccount from './pages/My-Account';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function AppContent() {
  const [showAccount, setShowAccount] = useState(false);
  const location = useLocation();

  const toggleAccount = () => setShowAccount(prev => !prev);

  useEffect(() => {
    setShowAccount(false);
  }, [location.pathname]);

  const isAuthPage = ['/signup', '/login', '/role-selection'].includes(location.pathname);

  return (
    <>
      {!isAuthPage && (
        <Navbar 
          goToLogin={() => window.location.href = '/login'}
          showAccount={showAccount}
          setShowAccount={toggleAccount}
        />
      )}

      {showAccount && <Account onClose={toggleAccount} />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/role-selection' element={<RoleSelection />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
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
      </Routes>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;