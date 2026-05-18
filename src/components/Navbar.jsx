import React, { useContext, useRef, useLayoutEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import FilterPanel from './FilterPanel';

function Navbar({ goToJoin, setShowAccount, listingSearch, setListingSearch, listingFilters, setListingFilters, onHeightChange }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const activeFilterCount = [
    (listingFilters.priceMin || listingFilters.priceMax) ? 1 : 0,
    listingFilters.bedrooms.length,
    listingFilters.bathrooms.length,
    listingFilters.amenities.length,
  ].reduce((a, b) => a + b, 0);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar filtros al salir de /listings
  React.useEffect(() => {
    if (location.pathname !== '/listings') setShowFilters(false);
  }, [location.pathname]);

  // Reportar altura real del navbar cuando cambie
  useLayoutEffect(() => {
    if (!navRef.current) return;
    const report = () => onHeightChange && onHeightChange(navRef.current.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [onHeightChange]);

  // Always use solid style — new design has light hero
  const isFlush = false;

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
    <nav ref={navRef} className="fixed top-0 w-screen z-50">
      <div className={`transition-all duration-300 bg-paper/85 backdrop-blur-md border-b border-line ${scrolled ? 'shadow-sm' : ''}`}>
      {/* Fila principal: logo + nav a la izq, acciones a la der */}
      <div className="flex items-center justify-between px-8 py-3 max-w-[1440px] mx-auto">
        {/* Izquierda: Logo + Nav links */}
        <div className="flex items-center gap-4">
          <div onClick={handleTitleClick} className="font-display text-xl leading-none text-ink cursor-pointer select-none whitespace-nowrap">
            Rent<span className="italic-serif text-brand-500">UP</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => { window.scrollTo(0, 0); navigate(link.path); }}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive(link.path)
                    ? 'bg-brand-100 text-brand-700 font-semibold'
                    : 'text-ink-soft hover:bg-paper-sunk hover:text-ink'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Derecha: tenant links + acciones + hamburger */}
        <div className="flex items-center gap-3">
          {/* Facturación y Mis Arriendos — solo inquilino */}
          {user && userRole === 1 && (
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => { window.scrollTo(0, 0); navigate('/facturacion'); }}
                className="px-3 py-1.5 rounded-full text-sm text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors"
              >
                Facturación
              </button>
              <button
                onClick={() => { window.scrollTo(0, 0); navigate('/mis-arriendos'); }}
                className="px-3 py-1.5 rounded-full text-sm text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors"
              >
                Mis Arriendos
              </button>
            </div>
          )}
          {/* Desktop: user actions */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <button onClick={() => { window.scrollTo(0, 0); navigate('/login'); }} className="pbtn pbtn-outline text-sm px-4 py-2">
                  Iniciar sesión
                </button>
                <button onClick={goToJoin} className="pbtn pbtn-primary text-sm px-5 py-2">
                  Registrarse
                </button>
              </>
            ) : (
              <>
                {userRole === 2 && (
                    <button onClick={() => { window.scrollTo(0, 0); navigate('/dashboard'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors">
                      <span className="material-symbols-outlined text-sm">dashboard</span>
                      <span>Panel</span>
                    </button>
                )}
                {userRole === 3 && (
                    <button onClick={() => { window.scrollTo(0, 0); navigate('/admin/apartments'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors">
                      <span className="material-symbols-outlined text-sm">shield</span>
                      <span>Admin</span>
                    </button>
                )}
                <button onClick={handleUserClick} className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Mi cuenta">
                  <span className="material-symbols-outlined text-sm">person</span>
                </button>
              </>
            )}
          </div>
          {/* Hamburger — siempre visible en mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-9 h-9 rounded-full hover:bg-paper-sunk flex items-center justify-center text-ink-soft transition-colors">
              <span className="material-symbols-outlined text-sm">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fila de búsqueda — solo en /listings, debajo del navbar */}
      {location.pathname === '/listings' && (
        <>
          <div className="border-t border-line" />
          <div className="px-8 py-3 max-w-[1440px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-paper-sunk border border-line rounded-full px-4 py-2.5 flex-1 max-w-xl">
                <span className="material-symbols-outlined text-brand-500 text-sm">search</span>
                <input
                  className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-muted leading-none"
                  placeholder="Buscar por ubicación..."
                  value={listingSearch}
                  onChange={e => setListingSearch(e.target.value)}
                />
                {listingSearch && (
                  <button onClick={() => setListingSearch('')} className="text-ink-muted hover:text-ink leading-none">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all border ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-paper-sunk text-ink-soft border-line hover:bg-paper-sunk-hover hover:text-ink'
                }`}
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                Filtros
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          {showFilters && (
            <FilterPanel filters={listingFilters} setFilters={setListingFilters} />
          )}
        </>
      )}

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-line bg-paper/95 backdrop-blur-md">
          <div className="flex flex-col gap-1 px-8 py-4">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => { window.scrollTo(0, 0); navigate(link.path); setIsMenuOpen(false); }} className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                isActive(link.path) ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-ink-soft hover:bg-paper-sunk hover:text-ink'
              }`}>
                {link.label}
              </button>
            ))}
            {!user ? (
              <div className="flex flex-col gap-2 mt-2">
                <button onClick={() => { window.scrollTo(0, 0); navigate('/login'); setIsMenuOpen(false); }} className="w-full py-2.5 rounded-full text-sm border border-line-strong text-ink hover:bg-paper-sunk transition-colors">
                  Iniciar sesión
                </button>
                <button onClick={() => { goToJoin(); setIsMenuOpen(false); }} className="w-full py-2.5 rounded-full text-sm bg-brand-500 text-white hover:bg-brand-600 transition-colors">
                  Registrarse
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => { window.scrollTo(0, 0); navigate('/my-account'); setIsMenuOpen(false); }} className="w-full text-left text-sm py-2 px-3 rounded-lg text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors">
                  Mi Cuenta
                </button>
                {userRole === 1 && (
                  <>
                    <button onClick={() => { window.scrollTo(0, 0); navigate('/facturacion'); setIsMenuOpen(false); }} className="w-full text-left text-sm py-2 px-3 rounded-lg text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors">
                      Facturación
                    </button>
                    <button onClick={() => { window.scrollTo(0, 0); navigate('/mis-arriendos'); setIsMenuOpen(false); }} className="w-full text-left text-sm py-2 px-3 rounded-lg text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors">
                      Mis Arriendos
                    </button>
                  </>
                )}
                {userRole === 2 && (
                  <button onClick={() => { window.scrollTo(0, 0); navigate('/dashboard'); setIsMenuOpen(false); }} className="w-full text-left text-sm py-2 px-3 rounded-lg text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors">
                    Panel de Gestión
                  </button>
                )}
                {userRole === 3 && (
                  <button onClick={() => { window.scrollTo(0, 0); navigate('/admin/apartments'); setIsMenuOpen(false); }} className="w-full text-left text-sm py-2 px-3 rounded-lg text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors">
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
