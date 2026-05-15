import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import PropertyDetailModal from "../components/PropertyDetailModal";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/apartments/getapts`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setFeatured(data.slice(0, 3));
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
    <div className="bg-background text-on-background font-body">
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-8 py-24 md:py-40">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Encuentra tu próximo hogar cerca de la Universidad del Putumayo
              </h1>
              <p className="font-body text-body-md opacity-90 max-w-lg">
                Soluciones de vivienda premium diseñadas exclusivamente para estudiantes. Comodidad, seguridad y cercanía para que te enfoques en lo que realmente importa: tu futuro.
              </p>
              <div className="bg-surface-container-lowest p-2 rounded-xl shadow-lg flex flex-col md:flex-row gap-2 max-w-xl">
                <div className="flex-1 flex items-center px-4 gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <input className="w-full bg-transparent border-none focus:ring-0 font-body text-body-md placeholder:text-outline py-3" placeholder="Barrio, calle o lugar..." type="text"/>
                </div>
                <button className="bg-primary hover:bg-surface-tint text-on-primary px-8 py-4 rounded-lg font-headline text-headline-md flex items-center justify-center gap-2 transition-all duration-300">
                  <span>Buscar</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10 transform rotate-2">
                <img className="w-full h-full object-cover" alt="A bright and airy modern student apartment interior" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXpp3HeVcF5hTM7fSqVLgwUZAH0izqg7dP9qaH1wWB45R0FcI-mBdMW8Xn9MFXwd8ybhrPg5Enb9mslBut9h6UNYKH-XgRS078Ez1Q_ckRH62awr32TX7Fwmf4Y7N6JMBEJc-QoKwrsP0IKgd4Bh-CDjr_h4LJIU43CmD-noDgGtKfpCr5XY63T4Vhcy5P-R_N71fQPDSO9OVqF4Y2P5NqqYnF4EiR5in0R-_cOT_xwyS07e5k5bTJhcMnOXlHffxINzlDGOIdvyzC"/>
              </div>

            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20"></div>
        </section>

        {/* Propiedades Destacadas Section */}
        <section className="bg-surface-container-low py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="space-y-2">
                <span className="text-secondary font-label text-label-md uppercase tracking-widest">Nuestra Selección</span>
                <h2 className="font-headline text-headline-lg text-on-surface">Propiedades Destacadas</h2>
                <p className="font-body text-body-md text-on-surface-variant max-w-md">Las mejores opciones de vivienda estudiantil curadas por nuestro equipo de expertos en Mocoa.</p>
              </div>
              <span onClick={() => navigate('/listings')} className="group flex items-center gap-2 text-primary font-headline text-headline-md hover:underline decoration-2 underline-offset-4 cursor-pointer">
                Ver todas las propiedades
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">trending_flat</span>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((apt) => (
                <PropertyCard key={apt.id_apt} apt={apt} onViewMore={handleViewMore} />
              ))}
            </div>
          </div>
        </section>



        {/* Search Map CTA Section */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="font-headline text-headline-lg text-on-surface">Explora por ubicación exacta</h2>
              <p className="font-body text-body-md text-on-surface-variant">
                Nuestra herramienta de mapa interactivo te permite ver exactamente qué tan cerca estarás de tus facultades, bibliotecas y centros de estudio de la Universidad del Putumayo.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary">check_circle</span>
                  <span className="font-body text-body-md">Rutas de acceso directo al campus</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary">check_circle</span>
                  <span className="font-body text-body-md">Zonas seguras e iluminadas</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary">check_circle</span>
                  <span className="font-body text-body-md">Filtros por presupuesto y servicios</span>
                </li>
              </ul>
              <button onClick={() => navigate('/map')} className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-headline text-headline-md shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95">Abrir Mapa Interactivo</button>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] bg-surface-container-high relative">
              <img className="w-full h-full object-cover" alt="A detailed map of Mocoa" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9vBrYYfj540GqO7AXGDFM1XzKnDo2FDBPStijQHPPPmmZzMWK6uQTrWl5aEW-xPDnCIkb-YdDLtjY_-nmwTGxVGaNBgpBLJ0lLRR-LDO_fK8O_0GRWpsYFrGCFJGw9AzDptOlubXzaJJEl-FAjYPv_vHyNz3gWI9oqVQpsOfWHA-JPzgQ07DuPSrHnBVB5l4EURaDbq1IwsGCc2ItI4oyGXeYoCSGEbDITOVWaoeaP10XIUgIQwYc3BXMczC6jGKplWmqAe8nYtqa"/>
              <div className="absolute inset-0 bg-primary/10 pointer-events-none"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full pt-16 pb-8 bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-8 max-w-7xl mx-auto gap-8">
          <div className="space-y-4">
            <div className="font-headline text-headline-md font-bold text-on-surface">RentUp</div>
            <p className="font-body text-body-md text-secondary max-w-xs">Premium Student Living. Vivienda de calidad para la próxima generación de profesionales.</p>
          </div>
          <div className="grid grid-cols-2 md:flex gap-8 md:gap-12">
            <div className="flex flex-col gap-4">
              <p className="font-label text-label-md font-bold text-on-surface uppercase tracking-widest">Plataforma</p>
              <span className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100 cursor-pointer">Privacy Policy</span>
              <span className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100 cursor-pointer">Terms of Service</span>
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-label text-label-md font-bold text-on-surface uppercase tracking-widest">Soporte</p>
              <span className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100 cursor-pointer">Cookie Policy</span>
              <span className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100 cursor-pointer">Contact Support</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pt-12 mt-12 border-t border-surface-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-body-md text-on-surface-variant opacity-80">© 2026 RentUp. Premium Student Living.</p>
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all cursor-pointer">facebook</span>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all cursor-pointer">instagram</span>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all cursor-pointer">twitter</span>
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
