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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <button onClick={handleGoBack} className="fixed top-6 left-6 w-12 h-12 rounded-full cursor-pointer text-on-surface bg-surface-container-lowest/70 backdrop-blur-md z-50 hover:bg-surface-container-low hover:rotate-90 hover:scale-110 transition-all duration-300 flex items-center justify-center border border-surface-container-high shadow-xl">
        <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
      </button>

      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-4xl p-8 md:p-12 relative z-10 animate-scale-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FontAwesomeIcon icon={faHome} className="text-white text-2xl" />
          </div>
          <h1 className="text-headline-lg text-on-surface mb-3">¿Qué tipo de cuenta necesitas?</h1>
          <p className="text-on-surface-variant text-body-md">Selecciona tu rol para continuar con el registro</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
            selectedRole === 'usuario' 
              ? 'border-primary bg-primary-50 shadow-xl transform scale-[1.02]' 
              : 'border-surface-container-high hover:border-outline hover:shadow-lg'
          }`} onClick={() => setSelectedRole('usuario')}>
            {selectedRole === 'usuario' && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
              </div>
            )}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              selectedRole === 'usuario' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              <FontAwesomeIcon icon={faUser} className="text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Usuario</h2>
            <p className="text-on-surface-variant text-sm mb-4">Busco un lugar para vivir cerca de mi universidad</p>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} className="text-primary text-xs" /><span>Buscar apartamentos</span></li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} className="text-primary text-xs" /><span>Contactar arrendadores</span></li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} className="text-primary text-xs" /><span>Dejar reseñas</span></li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} className="text-primary text-xs" /><span>Gestionar reservas</span></li>
            </ul>
          </div>

          <div className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
            selectedRole === 'arrendador' 
              ? 'border-primary bg-primary-50 shadow-xl transform scale-[1.02]' 
              : 'border-surface-container-high hover:border-outline hover:shadow-lg'
          }`} onClick={() => setSelectedRole('arrendador')}>
            {selectedRole === 'arrendador' && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
              </div>
            )}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              selectedRole === 'arrendador' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              <FontAwesomeIcon icon={faBuilding} className="text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Arrendador</h2>
            <p className="text-on-surface-variant text-sm mb-4">Quiero alquilar mis propiedades a estudiantes</p>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} className="text-primary text-xs" /><span>Publicar apartamentos</span></li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} className="text-primary text-xs" /><span>Gestionar reservas</span></li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} className="text-primary text-xs" /><span>Recibir pagos</span></li>
              <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} className="text-primary text-xs" /><span>Ver estadísticas</span></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <button className="px-6 py-3 btn-secondary flex items-center gap-2" onClick={handleGoBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Volver al inicio</span>
          </button>
          <button className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
            selectedRole ? 'bg-primary-gradient text-white shadow-lg hover:shadow-primary-glow-lg hover:-translate-y-1' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
          }`} onClick={handleContinue} disabled={!selectedRole}>
            <span>Continuar</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        <p className="text-center text-on-surface-variant mt-6">
          ¿Ya tienes cuenta?{" "}
          <span onClick={() => navigate('/login')} className="text-primary font-semibold cursor-pointer hover:text-primary-600 hover:underline">
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
}

export default RoleSelection;
