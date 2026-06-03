import React, { useState, useEffect } from 'react';
import { Joyride, ACTIONS, STATUS } from 'react-joyride';

const TOUR_KEY = 'rentup_tour_completed';

const stepContent = [
  {
    target: '#rentup-logo',
    content: (
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>¡Bienvenido a RentUp! 🏠</h3>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: '#555' }}>
          El portal líder en Mocoa diseñado para conectar estudiantes con hogares seguros y verificados. ¡Comencemos este breve recorrido!
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.property-card',
    content: (
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Propiedades Destacadas</h3>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: '#555' }}>
          Cada tarjeta resume lo esencial: precio, capacidad y ubicación exacta. Haz clic en <strong>Ver</strong> para más detalles o <strong>Ubicación</strong> para verla en el mapa.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '#rentup-nav-mapa',
    content: (
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Búsqueda Inteligente (Mapa) 🗺️</h3>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: '#555' }}>
          No busques a ciegas. Usa nuestro mapa interactivo para filtrar propiedades por zonas cercanas a tu universidad. ¡Encuentra tu lugar ideal geográficamente!
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '#rentup-mi-espacio',
    content: (
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Tu Dashboard Personal 💼</h3>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: '#555' }}>
          En "Mi Espacio" gestionas todo tu proceso: estado de visitas, contratos activos, pagos pendientes y reportes. Es tu oficina virtual de arrendamiento.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '#rentup-mensajes',
    content: (
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Comunicación Directa 💬</h3>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: '#555' }}>
          ¿Tienes dudas? Chatea en tiempo real con los arrendadores. La transparencia es clave para una convivencia exitosa. <strong>¡Ya puedes empezar a buscar tu próximo hogar!</strong>
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
];

function OnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { action, status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) || action === ACTIONS.CLOSE) {
      setRun(false);
      localStorage.setItem(TOUR_KEY, 'true');
    }
  };

  const styles = {
    options: {
      primaryColor: '#005088',
      textColor: '#005088',
      arrowColor: '#fff',
      backgroundColor: '#fff',
      zIndex: 10000,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      width: 420,
    },
    tooltipContainer: {
      textAlign: 'left',
      borderRadius: 16,
      boxShadow: '0 12px 48px rgba(0, 80, 136, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    buttonNext: {
      backgroundColor: '#005088',
      color: '#fff',
      fontSize: 13,
      fontWeight: 600,
      borderRadius: 10,
      padding: '10px 24px',
    },
    buttonBack: {
      color: '#005088',
      fontSize: 13,
      fontWeight: 500,
      marginRight: 8,
    },
    buttonSkip: {
      color: '#8e8ea0',
      fontSize: 13,
      fontWeight: 500,
    },
    progress: {
      color: '#005088',
      fontSize: 12,
      fontWeight: 500,
    },
  };

  return (
    <Joyride
      steps={stepContent}
      run={run}
      callback={handleJoyrideCallback}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      scrollOffset={80}
      disableScrolling={false}
      spotlightClicks
      styles={styles}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: '¡Entendido!',
        next: 'Siguiente',
        skip: 'Saltar',
      }}
    />
  );
}

export default OnboardingTour;
