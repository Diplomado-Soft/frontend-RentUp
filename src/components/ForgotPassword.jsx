import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaCheck, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import axiosInstance from '../contexts/axiosInstance';
import './ForgotPassword.css';

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [hasPhone, setHasPhone] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axiosInstance.post('/auth/forgot-password', {
                email,
                step: 1
            });
            
            if (response.data.success) {
                setHasPhone(response.data.hasPhone);
                setStep(2);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const handleSendCode = async (method) => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (method === 'email') {
                const response = await axiosInstance.post('/auth/forgot-password', {
                    email,
                    step: 2,
                    method: 'email'
                });
                setMessage(response.data.message || 'Código enviado por correo');
                setStep(4);
            } else {
                setStep(3);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al enviar el código');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axiosInstance.post('/auth/forgot-password', {
                email,
                phoneNumber,
                step: 2,
                method: 'sms'
            });
            
            setMessage(response.data.message || 'Código enviado por SMS');
            setStep(4);
        } catch (error) {
            setError(error.response?.data?.error || 'Error al enviar el código');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!verificationCode || !newPassword) {
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
                code: verificationCode,
                newPassword
            });
            
            setMessage(response.data.message || 'Contraseña restablecida exitosamente');
            setStep(5);
        } catch (error) {
            setError(error.response?.data?.error || 'Error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Email</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Método</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Código</span>
            </div>
        </div>
    );

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="card-header">
                    <FaShieldAlt className="header-icon" />
                    <h2>Recuperar contraseña</h2>
                </div>

                {renderStepIndicator()}

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="step-content">
                        <p className="step-description">
                            Ingresa el correo con el que creaste tu cuenta
                        </p>

                        <div className="form-group">
                            <label htmlFor="email">
                                <FaEnvelope /> Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                className="form-control"
                                autoFocus
                            />
                        </div>

                        {message && (
                            <div className="alert alert-success">
                                <FaCheck /> {message}
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading || !email.trim()}
                        >
                            {loading ? 'Verificando...' : 'Continuar'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div className="step-content">
                        <p className="step-description">
                            Elige cómo quieres recibir tu código de verificación
                        </p>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <div className="method-selector">
                            <button 
                                className="method-btn"
                                onClick={() => handleSendCode('email')}
                                disabled={loading}
                            >
                                <FaEnvelope className="method-icon" />
                                <span className="method-text">Enviar por Email</span>
                            </button>
                            {hasPhone && (
                                <button 
                                    className="method-btn"
                                    onClick={() => handleSendCode('sms')}
                                    disabled={loading}
                                >
                                    <FaPhone className="method-icon" />
                                    <span className="method-text">Enviar por SMS</span>
                                </button>
                            )}
                        </div>

                        {!hasPhone && (
                            <p className="info-text">
                                No tienes teléfono registrado. Solo disponible por email.
                            </p>
                        )}

                        <button
                            className="btn btn-secondary btn-block"
                            onClick={() => {
                                setStep(1);
                                setError('');
                            }}
                        >
                            <FaArrowLeft /> Volver
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handlePhoneSubmit} className="step-content">
                        <p className="step-description">
                            Ingresa el número de teléfono que registraste en tu cuenta
                        </p>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="phone">
                                <FaPhone /> Número de teléfono
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="3001234567 o +573001234567"
                                required
                                className="form-control"
                                autoFocus
                            />
                            <small className="form-help">
                                Se agregará el código de país automáticamente si no lo incluyes
                            </small>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading || !phoneNumber.trim()}
                        >
                            {loading ? 'Enviando código...' : 'Enviar código SMS'}
                        </button>

                        <button
                            className="btn btn-secondary btn-block"
                            onClick={() => {
                                setStep(2);
                                setPhoneNumber('');
                                setError('');
                            }}
                        >
                            <FaArrowLeft /> Volver
                        </button>
                    </form>
                )}

                {step === 4 && (
                    <form onSubmit={handleResetPassword} className="step-content">
                        <p className="step-description">
                            Ingresa el código de verificación que recibiste y tu nueva contraseña
                        </p>

                        {message && (
                            <div className="alert alert-success">
                                <FaCheck /> {message}
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="code">Código de verificación</label>
                            <input
                                type="text"
                                id="code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                required
                                maxLength="6"
                                className="form-control code-input"
                                autoFocus
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
                            disabled={loading || !verificationCode.trim() || !newPassword.trim() || !confirmPassword.trim()}
                        >
                            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                        </button>

                        <button
                            className="btn btn-secondary btn-block"
                            onClick={() => {
                                setStep(hasPhone ? 2 : 1);
                                setVerificationCode('');
                                setNewPassword('');
                                setConfirmPassword('');
                                setError('');
                            }}
                        >
                            <FaArrowLeft /> Volver
                        </button>
                    </form>
                )}

                {step === 5 && (
                    <div className="step-content success-content">
                        <div className="success-icon">
                            <FaCheck />
                        </div>
                        <h3>¡Contraseña restablecida!</h3>
                        <p className="step-description">
                            Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-block">
                            Ir al inicio de sesión
                        </Link>
                    </div>
                )}

                <div className="forgot-links">
                    <Link to="/login">← Volver al inicio de sesión</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
