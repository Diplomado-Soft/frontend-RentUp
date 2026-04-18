import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import { UserProvider } from './contexts/UserContext';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';

import './App.css';
import MyAccount from './pages/My-Account';
import ProtectedRoute from './contexts/ProtectedRoute';

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/role-selection" element={<RoleSelection />} />

          {/* My Account: para usuarios autenticados (cualquier rol) */}
        <Route path='/my-account' element={<MyAccount />} />
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