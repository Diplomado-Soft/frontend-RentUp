import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

function GitHubCallback() {
    const { login } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
            const messages = {
                no_code: 'No se recibió autorización de GitHub.',
                token_failed: 'Error al obtener el token de GitHub.',
                no_email: 'Tu cuenta de GitHub no tiene un email público verificado. Actívalo en github.com/settings/emails.',
                user_creation_failed: 'No se pudo crear el usuario.',
                server_error: 'Error interno del servidor.',
            };
            navigate('/login', { state: { errorMsg: messages[error] || 'Error desconocido.' } });
            return;
        }

        if (userParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));
                login(userData);
                navigate('/');
            } catch {
                navigate('/login', { state: { errorMsg: 'Error procesando la sesión.' } });
            }
        } else {
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            gap: '16px'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(255,255,255,0.3)',
                borderTop: '4px solid white',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ fontSize: '18px', fontWeight: 500 }}>Iniciando sesión con GitHub...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default GitHubCallback;
