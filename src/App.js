
import React from 'react';
import { UserProvider } from "./contexts/UserContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <UserProvider>
      <Router>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/role-selection' element={<RoleSelection />} />
        </Routes>
      </Router>
    </UserProvider>
  </GoogleOAuthProvider>
  );
}
export default App;
