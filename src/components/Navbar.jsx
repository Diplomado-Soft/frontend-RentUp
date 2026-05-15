import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ goToJoin, setShowAccount }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const userRole = user?.rol || user?.rol_id || user?.rolId || null;

  const handleTitleClick = () => {
      navigate('/');
  };

  const handleUserClick = () => {
      setShowAccount(prev => !prev);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Listings', path: '/listings' },
    { label: 'Map', path: '/map' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div onClick={handleTitleClick} className="font-headline text-headline-md font-bold text-primary cursor-pointer">
          RentUp
        </div>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className={`font-label text-label-md transition-all duration-300 ease-in-out active:scale-95 ${
                isActive(link.path)
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg p-2'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant p-2 hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          {!user ? (
            <button onClick={goToJoin} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label text-label-md transition-all duration-300 ease-in-out active:scale-95">
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {userRole === 2 && (
                  <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface text-label-md hover:bg-surface-container-highest transition-all duration-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    <span>Panel</span>
                  </button>
              )}
              {userRole === 3 && (
                  <button onClick={() => navigate('/admin/apartments')} className="px-4 py-2 rounded-lg bg-tertiary-container text-white text-label-md hover:bg-tertiary-600 transition-all duration-300 flex items-center gap-2 shadow-ambient-sm">
                    <span className="material-symbols-outlined text-lg">shield</span>
                    <span>Admin</span>
                  </button>
              )}
              <button onClick={handleUserClick} className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center transition-all duration-300 hover:shadow-primary-glow hover:scale-105" title="Mi cuenta">
                <span className="material-symbols-outlined text-sm">person</span>
              </button>
            </div>
          )}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-9 h-9 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden border-t border-surface-container bg-surface/70 backdrop-blur-md">
          <div className="flex flex-col gap-2 px-8 py-4">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => { navigate(link.path); setIsMenuOpen(false); }} className="w-full text-left font-body text-body-md text-on-surface-variant hover:text-primary py-2">
                {link.label}
              </button>
            ))}
            {!user ? (
              <button onClick={() => { goToJoin(); setIsMenuOpen(false); }} className="w-full py-3 rounded-lg bg-primary text-on-primary font-label text-label-md mt-2">
                Sign In
              </button>
            ) : (
              <>
                <button onClick={() => { navigate('/my-account'); setIsMenuOpen(false); }} className="w-full text-left font-body text-body-md py-2 text-on-surface-variant">
                  Mi Cuenta
                </button>
                {userRole === 2 && (
                  <button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} className="w-full text-left font-body text-body-md py-2 text-on-surface-variant">
                    Panel de Gestión
                  </button>
                )}
                {userRole === 3 && (
                  <button onClick={() => { navigate('/admin/apartments'); setIsMenuOpen(false); }} className="w-full text-left font-body text-body-md py-2 text-on-surface-variant">
                    Panel de Admin
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
