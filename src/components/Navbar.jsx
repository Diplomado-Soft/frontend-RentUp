import React, { useContext, useRef, useLayoutEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import FilterPanel from './FilterPanel';
import MessagesPanel from './MessagesPanel';

function Navbar({ goToJoin, setShowAccount, listingSearch, setListingSearch, listingFilters, setListingFilters, onHeightChange,
  notifications, unreadCount, showNotifications, setShowNotifications, notifRef, fetchNotifications, markNotificationRead, markAllRead, deleteNotification }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showMessages, setShowMessages] = React.useState(false);
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

  const isLandlordPanel = ['/dashboard', '/mantenimiento-panel'].includes(location.pathname);
  const [searchParams] = useSearchParams();
  const activeDashboardTab = location.pathname === '/mantenimiento-panel'
    ? 'mantenimiento'
    : (searchParams.get('tab') || 'list');

  const dashboardNavItems = [
    { id: 'list', label: 'Mis Apartamentos', icon: 'domain', path: '/dashboard' },
    { id: 'contracts', label: 'Contratos', icon: 'description', path: '/dashboard?tab=contracts' },
    { id: 'visits', label: 'Visitas', icon: 'calendar_month', path: '/dashboard?tab=visits' },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: 'build', path: '/mantenimiento-panel' },
  ];

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
          <div id="rentup-logo" onClick={handleTitleClick} className="cursor-pointer select-none">
            <img src="/Preview-nobg.png" alt="RentUP" className="h-16 w-auto" />
          </div>

          {isLandlordPanel ? (
            /* Dashboard tabs */
            <div className="hidden md:flex items-center gap-1">
              {dashboardNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { window.scrollTo(0, 0); navigate(item.path); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeDashboardTab === item.id
                      ? 'bg-brand-100 text-brand-700 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-line/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Public nav links */
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  id={link.label === 'Mapa' ? 'rentup-nav-mapa' : undefined}
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
          )}
        </div>

        {/* Derecha: tenant links + acciones + hamburger */}
        <div className="flex items-center gap-3">
          {/* Mi Espacio — solo inquilino */}
          {user && userRole === 1 && (
            <div className="hidden md:flex items-center gap-1">
              <button
                id="rentup-mi-espacio"
                onClick={() => { window.scrollTo(0, 0); navigate('/mi-espacio'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors"
              >
                <span className="material-symbols-outlined text-sm">space_dashboard</span>
                <span>Mi Espacio</span>
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
                {isLandlordPanel && (
                    <button onClick={() => { window.scrollTo(0, 0); navigate('/'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-ink-soft hover:text-error hover:bg-error/5 transition-colors">
                      <span className="material-symbols-outlined text-sm">logout</span>
                      <span>Salir</span>
                    </button>
                )}
                {isLandlordPanel && (
                    <button onClick={() => { window.scrollTo(0, 0); navigate('/dashboard'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-brand-100 text-brand-700 transition-all">
                      <span className="material-symbols-outlined text-sm">dashboard</span>
                      <span>Panel</span>
                    </button>
                )}
                {!isLandlordPanel && userRole === 2 && (
                    <button onClick={() => { window.scrollTo(0, 0); navigate('/dashboard'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors">
                      <span className="material-symbols-outlined text-sm">dashboard</span>
                      <span>Panel</span>
                    </button>
                )}
                {user && [1, 2].includes(userRole) && (
                    <button id="rentup-mensajes" onClick={() => setShowMessages(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors">
                      <span className="material-symbols-outlined text-sm">forum</span>
                      <span>Mensajes</span>
                    </button>
                )}
                {userRole === 3 && (
                    <button onClick={() => { window.scrollTo(0, 0); navigate('/admin/apartments'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors">
                      <span className="material-symbols-outlined text-sm">shield</span>
                      <span>Admin</span>
                    </button>
                )}
                {userRole === 3 && (
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                      className="relative w-10 h-10 rounded-full flex items-center justify-center text-ink-soft hover:bg-brand-500/5 hover:text-brand-500 transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-danger-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 shadow-sm">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-2xl border border-line z-50 animate-fade-in overflow-hidden">
                        <div className="p-4 border-b border-line flex items-center justify-between">
                          <span className="font-bold text-ink text-sm">Notificaciones</span>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
                              Marcar todas como leídas
                            </button>
                          )}
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-outline text-sm">Sin notificaciones</div>
                          ) : (
                            notifications.map(n => (
                              <div
                                key={n.id}
                                onClick={() => markNotificationRead(n.id)}
                                className={`px-4 py-3.5 cursor-pointer transition-colors flex gap-3 items-start ${
                                  n.read_at ? 'bg-white hover:bg-brand-500/5' : 'bg-brand-500/5 hover:bg-brand-500/10'
                                }`}
                              >
                                <span className="text-lg mt-0.5 flex-shrink-0">
                                  {n.type === 'review_flagged' ? <span className="material-symbols-outlined text-danger-500" style={{fontVariationSettings: "'FILL' 1"}}>flag</span> :
                                   n.type === 'new_review' ? <span className="material-symbols-outlined text-warning-400" style={{fontVariationSettings: "'FILL' 1"}}>star</span> :
                                   <span className="material-symbols-outlined text-brand-500">notifications</span>}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${n.read_at ? 'text-ink' : 'font-semibold text-ink'}`}>{n.title}</p>
                                  <p className="text-xs text-outline mt-0.5 line-clamp-2">{n.message}</p>
                                  <p className="text-[11px] text-outline/60 mt-1">{new Date(n.created_at).toLocaleString('es-CO')}</p>
                                </div>
                                {!n.read_at && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />}
                                <button onClick={(e) => deleteNotification(n.id, e)} className="p-1 hover:bg-line/30 rounded text-outline hover:text-danger-500 transition-colors flex-shrink-0 mt-0.5" title="Eliminar">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
              <div id="rentup-search-bar" className="flex items-center gap-2 bg-paper-sunk border border-line rounded-full px-4 py-2.5 flex-1 max-w-xl">
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
            {isLandlordPanel ? (
              dashboardNavItems.map(item => (
                <button key={item.id} onClick={() => { window.scrollTo(0, 0); navigate(item.path); setIsMenuOpen(false); }} className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                  activeDashboardTab === item.id ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-ink-soft hover:bg-paper-sunk hover:text-ink'
                }`}>
                  <span className="material-symbols-outlined text-sm align-middle mr-1.5">{item.icon}</span>
                  {item.label}
                </button>
              ))
            ) : (
              navLinks.map((link) => (
                <button key={link.label} onClick={() => { window.scrollTo(0, 0); navigate(link.path); setIsMenuOpen(false); }} className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                  isActive(link.path) ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-ink-soft hover:bg-paper-sunk hover:text-ink'
                }`}>
                  {link.label}
                </button>
              ))
            )}
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
                  <button onClick={() => { window.scrollTo(0, 0); navigate('/mi-espacio'); setIsMenuOpen(false); }} className="w-full text-left text-sm py-2 px-3 rounded-lg text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors">
                    Mi Espacio
                  </button>
                )}
                {user && [1, 2].includes(userRole) && (
                  <button onClick={() => { setShowMessages(true); setIsMenuOpen(false); }} className="w-full text-left text-sm py-2 px-3 rounded-lg text-ink-soft hover:bg-paper-sunk hover:text-ink transition-colors">
                    Mensajes
                  </button>
                )}
                {userRole === 2 && !isLandlordPanel && (
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

      {/* Messages Panel */}
      {showMessages && user && (
        <MessagesPanel userId={user.id} userRole={userRole} onClose={() => setShowMessages(false)} />
      )}
    </nav>
  );
}

export default Navbar;
