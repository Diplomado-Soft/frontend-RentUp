/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
    extend: {
        colors: {
        // Unificamos 'primary' con escala numérica para que coincida con tu CSS
        primary: {
            50: '#EEF2FF',
            500: '#6366F1',
          600: '#4F46E5', // Tu antiguo DEFAULT
          700: '#4338CA', // Tu antiguo dark
          light: '#818CF8', // Mantengo tus alias por si los usas
        },
        // Añadimos 'surface' que es el que más usas en el index.css y RoleSelection
        surface: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
        },
        // Añadimos accent para los gradientes de texto
        accent: {
            500: '#8B5CF6',
        },
        secondary: {
            light: '#60A5FA',
            DEFAULT: '#3B82F6',
            dark: '#2563EB',
        },
        success: {
            DEFAULT: '#10B981',
            light: '#34D399',
        },
        danger: {
            DEFAULT: '#EF4444',
            light: '#F87171',
            dark: '#DC2626',
        },
        },
        fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        },
        boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.05)',
        cardHover: '0 8px 15px rgba(0, 0, 0, 0.1)',
        buttonHover: '0 8px 15px rgba(79, 70, 229, 0.2)',
        button: '0 4px 6px rgba(79, 70, 229, 0.2)', // Requerido por .btn-primary
        inputFocus: '0 0 0 3px rgba(129, 140, 248, 0.2)',
        },
      // Añadimos las animaciones que faltaban
        keyframes: {
        'scale-in': {
            '0%': { transform: 'scale(0.95)', opacity: '0' },
            '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
            from: { opacity: '0', transform: 'translateY(20px)' },
            to: { opacity: '1', transform: 'translateY(0)' },
        }
        },
        animation: {
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        },
        borderRadius: {
        DEFAULT: '8px',
        xl: '12px', // Añadido para tus .btn y .input-field
        '2xl': '16px', // Añadido para tus .card
        '3xl': '24px',
        full: '9999px',
        },
        spacing: {
        '4rem': '4rem',
        '3rem': '3rem',
        },
    },
    },
    plugins: [],
}