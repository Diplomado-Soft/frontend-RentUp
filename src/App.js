import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/role-selection' element={<RoleSelection />} />
        </Routes>
      </Router>
    </>
  );
}
export default App;
