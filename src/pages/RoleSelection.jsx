import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/signup', { state: { role: selectedRole } });
    }
  };

  return (
    <div className="min-h-screen screen-enter flex items-center justify-center p-4 md:p-8 bg-paper-sunk/50 relative overflow-hidden">
      {/* Gridbg backdrop */}
      <div className="absolute inset-0 gridbg opacity-40 pointer-events-none" />

      {/* Volver al inicio — solo este */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-sm text-ink-muted hover:text-ink flex items-center gap-1.5 z-10"
      >
        <span className="material-symbols-outlined text-sm">arrow_back_ios</span> Volver al inicio
      </button>

      {/* Logo mobile */}
      <div className="absolute top-6 right-6 z-10 hidden md:block">
        <span className="font-display italic-serif text-xl text-ink">RentUP</span>
      </div>

      {/* Card container — same rcard style as AuthPage */}
      <div
        className="rcard bg-paper-card w-full max-w-[1080px] overflow-hidden relative flex items-center justify-center"
        style={{
          '--radius-card': '28px',
          '--card-shadow': '0 30px 80px -30px rgba(14,26,43,0.35), 0 0 0 1px rgba(14,26,43,0.05)',
          '--card-border': '1px solid transparent',
          minHeight: '720px'
        }}
      >
        <div className="w-full max-w-2xl px-8 md:px-16">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="material-symbols-outlined text-paper text-2xl">how_to_reg</span>
            </div>
            <h1 className="font-display text-[28px] font-bold text-ink mb-2">¿Qué tipo de cuenta necesitas?</h1>
            <p className="text-ink-muted text-sm">Selecciona tu rol para continuar con el registro</p>
          </div>

          {/* Role cards */}
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {/* Usuario */}
            <div
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedRole === 'usuario'
                  ? 'border-brand-500 bg-brand-50/50 shadow-lg'
                  : 'border-line bg-paper-card hover:border-ink-muted hover:shadow-md'
              }`}
              onClick={() => setSelectedRole('usuario')}
            >
              {selectedRole === 'usuario' && (
                <div className="absolute top-4 right-4 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-paper text-sm">check</span>
                </div>
              )}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                selectedRole === 'usuario' ? 'bg-brand-500 text-paper' : 'bg-line/30 text-ink-muted'
              }`}>
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
              <h2 className="text-lg font-bold text-ink mb-2">Usuario</h2>
              <p className="text-ink-muted text-sm mb-4">Busco un lugar para vivir cerca de mi universidad</p>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-500 text-sm">check_circle</span>
                  <span>Buscar apartamentos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-500 text-sm">check_circle</span>
                  <span>Contactar arrendadores</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-500 text-sm">check_circle</span>
                  <span>Dejar reseñas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-500 text-sm">check_circle</span>
                  <span>Gestionar reservas</span>
                </li>
              </ul>
            </div>

            {/* Arrendador */}
            <div
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedRole === 'arrendador'
                  ? 'border-brand-500 bg-brand-50/50 shadow-lg'
                  : 'border-line bg-paper-card hover:border-ink-muted hover:shadow-md'
              }`}
              onClick={() => setSelectedRole('arrendador')}
            >
              {selectedRole === 'arrendador' && (
                <div className="absolute top-4 right-4 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-paper text-sm">check</span>
                </div>
              )}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                selectedRole === 'arrendador' ? 'bg-brand-500 text-paper' : 'bg-line/30 text-ink-muted'
              }`}>
                <span className="material-symbols-outlined text-2xl">business</span>
              </div>
              <h2 className="text-lg font-bold text-ink mb-2">Arrendador</h2>
              <p className="text-ink-muted text-sm mb-4">Quiero alquilar mis propiedades a estudiantes</p>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-500 text-sm">check_circle</span>
                  <span>Publicar apartamentos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-500 text-sm">check_circle</span>
                  <span>Gestionar reservas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-500 text-sm">check_circle</span>
                  <span>Recibir pagos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-500 text-sm">check_circle</span>
                  <span>Ver estadísticas</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Continue button */}
          <div className="flex justify-center">
            <button
              className={`px-10 py-3 rounded-full font-semibold flex items-center gap-2 transition-all duration-300 ${
                selectedRole
                  ? 'bg-brand-500 text-paper shadow-md hover:shadow-lg hover:bg-brand-400 cursor-pointer'
                  : 'bg-line/30 text-ink-muted cursor-not-allowed'
              }`}
              onClick={handleContinue}
              disabled={!selectedRole}
            >
              <span>Continuar</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Login link */}
          <p className="text-center text-ink-muted mt-6 text-sm">
            ¿Ya tienes cuenta?{' '}
            <span onClick={() => navigate('/login')} className="text-brand-500 font-semibold cursor-pointer hover:text-brand-400 hover:underline">
              Inicia sesión
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
