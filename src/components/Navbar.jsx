import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClipboardList, faShieldAlt, faSignInAlt, faBars, faTimes, faHome } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function Navbar({ goToJoin, setShowAccount }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleTitleClick = () => {
      localStorage.setItem("mapCenter", JSON.stringify([1.157037, -76.651443]));
      navigate('/');
      window.location.reload();
  };

  const handleUserClick = () => {
      setShowAccount(prev => !prev);
  };

  return (
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-surface-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center h-12 sm:h-14">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={handleTitleClick}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                  <FontAwesomeIcon icon={faHome} className="text-white text-sm sm:text-lg" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  RentUp
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              {!user ? (
                  <button
                      onClick={goToJoin}
                      className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 transition-all duration-300 shadow-button hover:shadow-lg hover:-translate-y-0.5"
                  >
                      <FontAwesomeIcon icon={faSignInAlt} className="text-xs sm:text-sm" />
                      <span className="hidden sm:inline">Iniciar Sesión</span>
                  </button>
              ) : (
                  <>
                  {/* Botón Panel de Gestión - Solo para arrendadores (rol === 2) */}
                  {user.rol === 2 && (
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-700 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 transition-all duration-300 border border-surface-200 hover:border-surface-300"
                        title="Panel de Gestión"
                      >
                        <FontAwesomeIcon icon={faClipboardList} className="text-xs sm:text-sm" />
                        <span className="hidden sm:inline text-xs">Panel</span>
                      </button>
                  )}

                  {/* Botón Panel Admin - Solo para administradores (rol === 3) */}
                  {user.rol === 3 && (
                      <button
                        onClick={() => navigate('/admin/apartments')}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                        title="Panel de Admin"
                      >
                        <FontAwesomeIcon icon={faShieldAlt} className="text-xs sm:text-sm" />
                        <span className="hidden sm:inline text-xs">Admin</span>
                      </button>
                  )}
                  
                  <button
                      onClick={handleUserClick}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                      title="Mi cuenta"
                  >
                      <FontAwesomeIcon icon={faUser} className="text-xs sm:text-sm" />
                  </button>
                  </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-1 sm:gap-2">
              {user && (
                <button
                    onClick={handleUserClick}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center"
                >
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                </button>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface-100 hover:bg-surface-200 flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="text-surface-700 text-sm" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-3 border-t border-surface-100">
              {!user ? (
                <button
                    onClick={() => {
                      goToJoin();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                >
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span>Iniciar Sesión</span>
                </button>
              ) : (
                <div className="space-y-2">
                  {user.rol === 2 && (
                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-700 text-sm font-medium flex items-center gap-2 transition-all duration-300"
                      >
                        <FontAwesomeIcon icon={faClipboardList} />
                        <span>Panel de Gestión</span>
                      </button>
                  )}
                  {user.rol === 3 && (
                      <button
                        onClick={() => {
                          navigate('/admin/apartments');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium flex items-center gap-2 transition-all duration-300"
                      >
                        <FontAwesomeIcon icon={faShieldAlt} />
                        <span>Panel de Admin</span>
                      </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
  );
}

export default Navbar;
