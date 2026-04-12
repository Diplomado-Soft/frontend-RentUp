import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faArrowRight, faArrowLeft, faCheckCircle, faHome } from '@fortawesome/free-solid-svg-icons';

function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/signup', { state: { role: selectedRole } });
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-800 via-surface-700 to-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Exit button */}
      <button 
        onClick={handleGoBack}
        className="fixed top-6 left-6 w-12 h-12 rounded-full cursor-pointer text-white bg-white/10 backdrop-blur-md z-50 hover:bg-white/20 hover:rotate-90 hover:scale-110 transition-all duration-300 flex items-center justify-center border border-white/20 shadow-xl"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8 md:p-12 relative z-10 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FontAwesomeIcon icon={faHome} className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-surface-800 mb-3">¿Qué tipo de cuenta necesitas?</h1>
          <p className="text-surface-500 text-lg">Selecciona tu rol para continuar con el registro</p>
        </div>

        {/* Role Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Usuario */}
          <div
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              selectedRole === 'usuario' 
                ? 'border-primary-500 bg-primary-50 shadow-xl transform scale-[1.02]' 
                : 'border-surface-200 hover:border-surface-300 hover:shadow-lg'
            }`}
            onClick={() => setSelectedRole('usuario')}
          >
            {selectedRole === 'usuario' && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
              </div>
            )}
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              selectedRole === 'usuario' 
                ? 'bg-primary-500 text-white' 
                : 'bg-surface-100 text-surface-600'
            }`}>
              <FontAwesomeIcon icon={faUser} className="text-2xl" />
            </div>
            
            <h2 className="text-xl font-bold text-surface-800 mb-2">Usuario</h2>
            <p className="text-surface-500 text-sm mb-4">Busco un lugar para vivir cerca de mi universidad</p>
            
            <ul className="space-y-2 text-sm text-surface-600">
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500 text-xs" />
                <span>Buscar apartamentos</span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500 text-xs" />
                <span>Contactar arrendadores</span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500 text-xs" />
                <span>Dejar reseñas</span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500 text-xs" />
                <span>Gestionar reservas</span>
              </li>
            </ul>
          </div>

          {/* Arrendador */}
          <div
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              selectedRole === 'arrendador' 
                ? 'border-primary-500 bg-primary-50 shadow-xl transform scale-[1.02]' 
                : 'border-surface-200 hover:border-surface-300 hover:shadow-lg'
            }`}
            onClick={() => setSelectedRole('arrendador')}
          >
            {selectedRole === 'arrendador' && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
              </div>
            )}
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              selectedRole === 'arrendador' 
                ? 'bg-primary-500 text-white' 
                : 'bg-surface-100 text-surface-600'
            }`}>
              <FontAwesomeIcon icon={faBuilding} className="text-2xl" />
            </div>
            
            <h2 className="text-xl font-bold text-surface-800 mb-2">Arrendador</h2>
            <p className="text-surface-500 text-sm mb-4">Quiero alquilar mis propiedades</p>
            
            <ul className="space-y-2 text-sm text-surface-600">
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500 text-xs" />
                <span>Publicar apartamentos</span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500 text-xs" />
                <span>Gestionar reservas</span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500 text-xs" />
                <span>Recibir pagos</span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-primary-500 text-xs" />
                <span>Ver estadísticas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <button 
            className="btn-secondary px-6 py-3 rounded-xl flex items-center gap-2"
            onClick={handleGoBack}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Volver al inicio</span>
          </button>
          
          <button 
            className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
              selectedRole 
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1' 
                : 'bg-surface-200 text-surface-400 cursor-not-allowed'
            }`}
            onClick={handleContinue}
            disabled={!selectedRole}
          >
            <span>Continuar</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {/* Login Redirect */}
        <p className="text-center text-surface-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <span 
            onClick={() => navigate('/login')} 
            className="text-primary-600 font-semibold cursor-pointer hover:text-primary-700 hover:underline"
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
}

export default RoleSelection;
