import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import PropertyDetailModal from "../components/PropertyDetailModal";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    document.title = 'RentUp - Encuentra tu próximo hogar';
    fetch(`${API_URL}/apartments/getapts`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeatured(data.slice(0, 8));
          setTotalCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  const handleViewMore = (apt) => {
    setSelectedProperty(apt);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProperty(null);
  };

  return (
    <Fragment>
    <div className="screen-enter bg-paper text-ink font-body">
      <main>
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 gridbg opacity-50 pointer-events-none" />
          <div className="max-w-[1440px] mx-auto px-8 pt-28 pb-24 grid md:grid-cols-12 gap-8 relative">
            {/* Left content */}
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-muted font-medium mb-6">
                <span className="w-8 h-px bg-ink-muted" /> Arriendo de apartamentos en Mocoa
              </div>
              <h1 className="font-display text-[56px] md:text-[72px] lg:text-[88px] leading-[0.95] tracking-tight text-ink">
                Encontrá tu próximo<br />
                hogar, <span className="italic-serif text-brand-500">cerca de</span><br />
                <span className="italic-serif text-brand-500">la Universidad.</span>
              </h1>
              <p className="mt-6 text-lg text-ink-soft max-w-xl leading-relaxed">
                Soluciones de vivienda premium diseñadas exclusivamente para estudiantes. Comodidad, seguridad y cercanía para que te enfoques en lo que realmente importa: tu futuro.
              </p>

              {/* Search bar */}
              <div className="mt-8 rcard p-2 flex items-center gap-2 max-w-2xl" style={{ '--radius-card': '999px' }}>
                <div className="flex-1 flex items-center gap-3 px-4">
                  <span className="material-symbols-outlined text-brand-500 text-lg">location_on</span>
                  <input
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-muted py-3"
                    placeholder="Barrio, calle o lugar..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/listings${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)}
                  />
                  <div className="h-6 w-px bg-line" />
                  <span className="text-sm font-medium text-ink-muted">Mocoa</span>
                </div>
                <button
                  onClick={() => navigate(`/listings${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)}
                  className="pbtn pbtn-primary px-6 py-3 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">search</span> Buscar
                </button>
              </div>

              {/* Quick location chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                {['Centro','San Agustín','Ciudad Jardín','Bello Horizonte','Prolongación'].map(n => (
                  <button key={n} onClick={() => navigate(`/listings?q=${encodeURIComponent(n)}`)} className="pchip bg-paper-card border border-line hover:border-ink text-ink-soft hover:text-ink">
                    <span className="material-symbols-outlined text-xs">location_on</span>{n}
                  </button>
                ))}
              </div>

              {/* Trust row */}
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-xl">
                {[
                  { n: totalCount + '+', l: 'propiedades activas' },
                  { n: '24h', l: 'aprobación promedio' }
                ].map(s => (
                  <div key={s.l}>
                    <div className="font-display text-4xl text-brand-500">{s.n}</div>
                    <div className="text-xs text-ink-muted mt-1 leading-tight">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual */}
            <div className="hidden md:block md:col-span-5 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
                  {/* Main photo */}
                  <div className="rounded-3xl overflow-hidden shadow-card-lift h-full">
                    <img
                      className="w-full h-full object-cover"
                      alt="A bright and airy modern student apartment interior"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXpp3HeVcF5hTM7fSqVLgwUZAH0izqg7dP9qaH1wWB45R0FcI-mBdMW8Xn9MFXwd8ybhrPg5Enb9mslBut9h6UNYKH-XgRS078Ez1Q_ckRH62awr32TX7Fwmf4Y7N6JMBEJc-QoKwrsP0IKgd4Bh-CDjr_h4LJIU43CmD-noDgGtKfpCr5XY63T4Vhcy5P-R_N71fQPDSO9OVqF4Y2P5NqqYnF4EiR5in0R-_cOT_xwyS07e5k5bTJhcMnOXlHffxINzlDGOIdvyzC"
                    />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -left-6 top-12 rcard bg-ink text-paper px-4 py-3" style={{ '--radius-card': '18px', '--card-shadow': '0 12px 40px -16px rgba(14,26,43,0.35)', '--card-border': '1px solid transparent' }}>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                      <span className="material-symbols-outlined text-[11px]">verified</span> Verificado
                    </div>
                    <div className="font-display text-xl leading-tight mt-1">100% propietarios reales</div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FEATURED ============ */}
        <section className="max-w-[1440px] mx-auto px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-muted font-medium mb-3">Nuestra Selección</div>
              <h2 className="font-display text-4xl md:text-5xl leading-none">
                Propiedades <span className="italic-serif text-brand-500">Destacadas</span>
              </h2>
              <p className="text-sm text-ink-muted mt-3 max-w-lg">
                Las mejores opciones de vivienda estudiantil curadas por nuestro equipo de expertos en Mocoa.
              </p>
            </div>
            <span onClick={() => navigate('/listings')} className="pbtn pbtn-ghost text-sm flex items-center gap-1">
              Ver todas
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((apt) => (
              <PropertyCard key={apt.id_apt} apt={apt} onViewMore={handleViewMore} />
            ))}
          </div>
        </section>

        {/* ============ MAP CTA ============ */}
        <section className="max-w-[1440px] mx-auto px-8 py-24 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="relative w-full" style={{ aspectRatio: '5/6' }}>
              <img
                className="w-full h-full object-cover rounded-3xl shadow-card-lift"
                alt="A detailed map of Mocoa"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9vBrYYfj540GqO7AXGDFM1XzKnDo2FDBPStijQHPPPmmZzMWK6uQTrWl5aEW-xPDnCIkb-YdDLtjY_-nmwTGxVGaNBgpBLJ0lLRR-LDO_fK8O_0GRWpsYFrGCFJGw9AzDptOlubXzaJJEl-FAjYPv_vHyNz3gWI9oqVQpsOfWHA-JPzgQ07DuPSrHnBVB5l4EURaDbq1IwsGCc2ItI4oyGXeYoCSGEbDITOVWaoeaP10XIUgIQwYc3BXMczC6jGKplWmqAe8nYtqa"
              />
              <div className="absolute -bottom-4 -right-4 rcard bg-paper-card p-5" style={{ '--radius-card': '16px' }}>
                <div className="font-display text-lg text-brand-500 leading-none">Mapa interactivo</div>
                <div className="text-xs text-ink-muted mt-1">Ubicación exacta</div>
              </div>
            </div>
          </div>
          <div className="md:col-span-7 flex flex-col justify-center">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted font-medium mb-3">Explorá por ubicación</div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              Encontrá tu lugar <span className="italic-serif text-brand-500">en el mapa</span><br />
              y llegá caminando.
            </h2>
            <div className="mt-8 space-y-4 max-w-lg">
              {[
                ['Rutas de acceso directo al campus', 'Calles seguras y bien iluminadas desde tu puerta hasta la facultad.'],
                ['Zonas seguras e iluminadas', 'Filtramos propiedades en sectores verificados con buena iluminación y vigilancia.'],
                ['Filtros por presupuesto y servicios', 'Ajustá precio, habitaciones, baños y servicios incluidos al instante.']
              ].map(([t, b]) => (
                <div key={t} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{t}</div>
                    <div className="text-sm text-ink-muted mt-0.5">{b}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => navigate('/map')} className="pbtn pbtn-primary px-8 py-3 text-base">
                Abrir Mapa Interactivo
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="max-w-[1440px] mx-auto px-8 pb-24">
          <div className="rcard bg-brand-500 text-paper p-12 md:p-16 grid md:grid-cols-12 gap-8 overflow-hidden relative" style={{ '--card-bg': '#2e5a88', '--card-border': '1px solid transparent', '--card-shadow': 'none', '--radius-card': '32px' }}>
            <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-brand-400 opacity-30" />
            <div className="absolute -right-40 -bottom-32 w-[500px] h-[500px] rounded-full bg-brand-300 opacity-20" />
            <div className="md:col-span-7 relative">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-none">
                Listo para<br />
                <span className="italic-serif">tu próxima dirección.</span>
              </h2>
              <p className="text-paper/80 mt-6 max-w-md text-sm leading-relaxed">
                Creá tu cuenta y empezá a guardar favoritos, agendar visitas y contactar propietarios en minutos.
              </p>
            </div>
            <div className="md:col-span-5 flex flex-col justify-center gap-3 relative">
              <button onClick={() => navigate('/signup', { state: { role: 'usuario' } })} className="pbtn bg-paper-card text-ink hover:bg-paper-sunk px-6 py-4 text-base justify-center">
                Crear cuenta como inquilino
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button onClick={() => navigate('/signup', { state: { role: 'arrendador' } })} className="pbtn border border-paper/30 text-paper hover:bg-paper/10 px-6 py-4 text-base justify-center">
                Soy propietario, publicar
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-line">
        <div className="max-w-[1440px] mx-auto px-8 py-12 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className="font-display text-xl leading-none text-ink">
              Rent<span className="italic-serif text-brand-500">UP</span>
            </div>
            <p className="text-sm text-ink-muted mt-4 max-w-xs">
              Premium Student Living. Vivienda de calidad para la próxima generación de profesionales.
            </p>
            <div className="text-xs text-ink-muted mt-6 font-mono">© 2026 RentUp · Mocoa, Putumayo</div>
          </div>
          {[
            { title: 'Inquilinos', items: ['Buscar', 'Cómo funciona', 'Garantías', 'Soporte'] },
            { title: 'Propietarios', items: ['Publicar', 'Verificación', 'Calculadora', 'Términos'] },
            { title: 'Empresa', items: ['Nosotros', 'Blog', 'Trabajá con nosotros', 'Contacto'] }
          ].map(col => (
            <div key={col.title} className="md:col-span-2">
              <div className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-4">{col.title}</div>
              <div className="space-y-2">
                {col.items.map(i => <div key={i} className="text-sm text-ink-soft hover:text-ink cursor-pointer">{i}</div>)}
              </div>
            </div>
          ))}
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-4">Contacto</div>
            <div className="space-y-2 text-sm text-ink-soft">
              <div>hola@rentup.co</div>
              <div className="font-mono">+57 601 234 5678</div>
            </div>
          </div>
        </div>
      </footer>
    </div>

    {showDetailModal && selectedProperty && (
      <PropertyDetailModal apartment={selectedProperty} onClose={closeDetailModal} />
    )}
    </Fragment>
  );
}

export default Home;
