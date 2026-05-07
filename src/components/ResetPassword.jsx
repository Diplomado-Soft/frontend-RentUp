import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../contexts/axiosInstance';
import './ResetPassword.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [codeSent, setCodeSent] = useState(false);

    useEffect(() => {
        // Si llega con token por URL (email), pre-llenar
        if (token) {
            setCode(token);
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!code || !newPassword) {
            setError('Código y nueva contraseña son requeridos');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axiosInstance.post('/auth/reset-password', {
                code,
                newPassword
            });
            setMessage(response.data.message || 'Contraseña restablecida exitosamente');
            setCodeSent(true);
        } catch (error) {
            setError(error.response?.data?.error || 'Error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                <h2>Restablecer contraseña</h2>
                <p className="reset-subtitle">
                    Ingresa el código de verificación y tu nueva contraseña.
                </p>

                {message && (
                    <div className="alert alert-success">
                        {message}
                        <div className="reset-links" style={{ marginTop: '15px' }}>
                            <Link to="/login" className="btn btn-primary btn-block">
                                Ir al inicio de sesión
                            </Link>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {!codeSent && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="code">Código de verificación</label>
                            <input
                                type="text"
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="123456"
                                required
                                maxLength="6"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Nueva contraseña</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength="6"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar contraseña</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite la contraseña"
                                required
                                className="form-control"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading || !code.trim() || !newPassword.trim() || !confirmPassword.trim()}
                        >
                            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                        </button>
                    </form>
                )}

                <div className="reset-links">
                    <Link to="/login">← Volver al inicio de sesión</Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
