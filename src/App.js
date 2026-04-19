import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import { UserProvider } from './contexts/UserContext';
import Login from './pages/Login';
import Signup from './pages/Signup'; // 1. IMPORTAR EL COMPONENTE
import RoleSelection from './pages/RoleSelection';

import './App.css';
import MyAccount from './pages/My-Account';
import ProtectedRoute from './contexts/ProtectedRoute';

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} /> {/* 2. AGREGAR LA RUTA */}
      <Route path="/role-selection" element={<RoleSelection />} />

      {/* My Account: para usuarios autenticados */}
      {/* Es recomendable usar ProtectedRoute aquí si quieres seguridad */}
      <Route 
        path='/my-account' 
        element={
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <UserProvider>
        <Router>
          <AppContent />
        </Router>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;