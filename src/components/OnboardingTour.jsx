import React, { useState, useEffect } from 'react';
import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride';

const TOUR_KEY = 'rentup_tour_completed';

const defaultSteps = [
  {
    target: '#rentup-search-bar',
    content: '¡Bienvenido a RentUp! 🏠 Aquí puedes buscar propiedades usando filtros o navegando directamente en el mapa.',
    title: '🔍 Busca tu hogar',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '#rentup-property-card',
    content: 'Revisa los detalles. Podrás ver fotos, precios y ubicar el apartamento exacto en nuestro mapa interactivo.',
    title: '📋 Explora propiedades',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '#rentup-cta-section',
    content: 'Conéctate y cierra el trato. Contacta al arrendador, agenda visitas y firma tu contrato de forma 100% digital.',
    title: '✍️ Firma digital',
    placement: 'top',
    disableBeacon: true,
  },
];

const joyrideStyles = {
  options: {
    arrowColor: '#fff',
    backgroundColor: '#fff',
    beaconSize: 36,
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    primaryColor: '#6A6BEF',
    spotlightShadow: '0 0 15px rgba(106, 107, 239, 0.4)',
    textColor: '#1e1e2f',
    width: 380,
    zIndex: 1000,
  },
  buttonSkip: {
    color: '#8e8ea0',
    fontSize: 13,
  },
  buttonBack: {
    color: '#6A6BEF',
    fontSize: 13,
    marginRight: 8,
  },
  buttonNext: {
    backgroundColor: '#6A6BEF',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 8,
    padding: '8px 20px',
  },
  tooltipContainer: {
    textAlign: 'left',
    lineHeight: 1.5,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
  },
  tooltipContent: {
    fontSize: 14,
    color: '#4a4a5a',
    padding: '0 0 8px',
  },
};

function OnboardingTour({ steps = defaultSteps }) {
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

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={handleJoyrideCallback}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrolling={false}
      spotlightClicks
      styles={joyrideStyles}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: '¡Listo!',
        next: 'Siguiente',
        skip: 'Saltar',
      }}
    />
  );
}

export { TOUR_KEY };
export default OnboardingTour;
