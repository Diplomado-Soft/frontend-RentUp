import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ goToJoin, setShowAccount }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;

  const userRole = user?.rol || user?.rol_id || user?.rolId || null;

  const handleTitleClick = () => {
      window.scrollTo(0, 0);
      navigate('/');
  };

  const handleUserClick = () => {
      setShowAccount(prev => !prev);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Arriendos', path: '/listings' },
    { label: 'Mapa', path: '/map' },
  ];

  return (
    <nav className="fixed top-0 w-screen z-50">
      <div className={`transition-all duration-300 ${
        isTransparent
          ? 'border-b border-white/20'
          : 'bg-white/40 backdrop-blur-xl border-b border-[#2E5A88]/20'
      }`}>
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div onClick={handleTitleClick} className={`font-headline text-headline-md font-bold cursor-pointer transition-colors duration-300 ${
          isTransparent ? 'text-white' : 'text-[#2E5A88]'
        }`}>
          RentUp
        </div>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => { window.scrollTo(0, 0); navigate(link.path); }}
              className={`font-label text-label-md transition-colors duration-200 px-3 pb-1.5 pt-1.5 font-bold border-b-2 ${
                isActive(link.path)
                  ? `${isTransparent ? 'text-white border-white' : 'text-[#2E5A88] border-[#2E5A88]'}`
                  : `${isTransparent ? 'text-white/60 hover:text-white/90 border-transparent hover:border-white/40' : 'text-on-surface-variant/60 hover:text-[#2E5A88] border-transparent hover:border-[#2E5A88]/40'}`
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button className={`p-2 rounded-lg transition-colors ${isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
            <span className="material-symbols-outlined">search</span>
          </button>
          {!user ? (
            <div className="flex items-center gap-2">
              <button onClick={() => { window.scrollTo(0, 0); navigate('/login'); }} className={`px-4 py-2.5 rounded-lg font-label text-label-md transition-all duration-300 ${
                isTransparent
                  ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}>
                Iniciar sesión
              </button>
              <button onClick={goToJoin} className={`px-6 py-2.5 rounded-lg font-label text-label-md transition-all duration-300 ease-in-out active:scale-95 ${
                isTransparent
                  ? 'bg-white/90 text-[#2E5A88] font-bold hover:bg-white'
                  : 'bg-[#2E5A88] text-white'
              }`}>
                Registrarse
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {userRole === 2 && (
                  <button onClick={() => { window.scrollTo(0, 0); navigate('/dashboard'); }} className={`px-4 py-2 rounded-lg text-label-md transition-all duration-300 flex items-center gap-2 ${
                    isTransparent
                      ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                  }`}>
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    <span>Panel</span>
                  </button>
              )}
              {userRole === 3 && (
                  <button onClick={() => { window.scrollTo(0, 0); navigate('/admin/apartments'); }} className={`px-4 py-2 rounded-lg text-label-md transition-all duration-300 flex items-center gap-2 shadow-ambient-sm ${
                    isTransparent
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-tertiary-container text-white hover:bg-tertiary-600'
                  }`}>
                    <span className="material-symbols-outlined text-lg">shield</span>
                    <span>Admin</span>
                  </button>
              )}
              <button onClick={handleUserClick} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 ${
                isTransparent
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-[#2E5A88] text-white'
               }`} title="Mi cuenta">
                <span className="material-symbols-outlined text-sm">person</span>
              </button>
            </div>
          )}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              isTransparent
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant'
            }`}>
              <span className="material-symbols-outlined text-sm">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className={`md:hidden border-t ${isTransparent ? 'border-white/20 bg-black/40 backdrop-blur-md' : 'border-surface-container bg-surface/70 backdrop-blur-md'}`}>
          <div className="flex flex-col gap-2 px-8 py-4">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => { window.scrollTo(0, 0); navigate(link.path); setIsMenuOpen(false); }} className={`w-full text-left font-body text-body-md py-2 ${
                isTransparent ? 'text-white/90 hover:text-white' : 'text-on-surface-variant hover:text-[#2E5A88]'
              }`}>
                {link.label}
              </button>
            ))}
            {!user ? (
              <div className="flex flex-col gap-2 mt-2">
                <button onClick={() => { window.scrollTo(0, 0); navigate('/login'); setIsMenuOpen(false); }} className={`w-full py-3 rounded-lg font-label text-label-md ${
                  isTransparent
                    ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}>
                  Iniciar sesión
                </button>
                <button onClick={() => { goToJoin(); setIsMenuOpen(false); }} className={`w-full py-3 rounded-lg font-label text-label-md ${
                  isTransparent
                    ? 'bg-white/90 text-[#2E5A88] font-bold'
                    : 'bg-[#2E5A88] text-white'
                }`}>
                  Registrarse
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => { window.scrollTo(0, 0); navigate('/my-account'); setIsMenuOpen(false); }} className={`w-full text-left font-body text-body-md py-2 ${
                  isTransparent ? 'text-white/80' : 'text-on-surface-variant'
                }`}>
                  Mi Cuenta
                </button>
                {userRole === 2 && (
                  <button onClick={() => { window.scrollTo(0, 0); navigate('/dashboard'); setIsMenuOpen(false); }} className={`w-full text-left font-body text-body-md py-2 ${
                    isTransparent ? 'text-white/80' : 'text-on-surface-variant'
                  }`}>
                    Panel de Gestión
                  </button>
                )}
                {userRole === 3 && (
                  <button onClick={() => { window.scrollTo(0, 0); navigate('/admin/apartments'); setIsMenuOpen(false); }} className={`w-full text-left font-body text-body-md py-2 ${
                    isTransparent ? 'text-white/80' : 'text-on-surface-variant'
                  }`}>
                    Panel de Admin
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </nav>
  );
}

export default Navbar;
