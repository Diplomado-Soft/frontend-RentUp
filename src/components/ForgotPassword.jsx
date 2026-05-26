import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiCheck, FiArrowLeft, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import axiosInstance from '../contexts/axiosInstance';
import './ForgotPassword.css';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hasPhone, setHasPhone] = useState(false);
  const [codeDigits, setCodeDigits] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [animDir, setAnimDir] = useState('next');

  const otpRefs = useRef([]);
  const emailRef = useRef(null);

  useEffect(() => {
    if (step === 1 && emailRef.current) {
      setTimeout(() => emailRef.current.focus(), 400);
    }
  }, [step]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email, step: 1 });
      if (response.data.success) {
        setHasPhone(response.data.hasPhone);
        setAnimDir('next');
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la solicitud');
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
        const response = await axiosInstance.post('/auth/forgot-password', { email, step: 2, method: 'email' });
        setMessage(response.data.message || 'Código enviado por correo');
        setAnimDir('next');
        setStep(4);
      } else {
        setAnimDir('next');
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el código');
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
        email, phoneNumber, step: 2, method: 'sms'
      });
      setMessage(response.data.message || 'Código enviado por SMS');
      setAnimDir('next');
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const verificationCode = codeDigits.join('');
    if (verificationCode.length < 6 || !newPassword) {
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
      const response = await axiosInstance.post('/auth/reset-password', { code: verificationCode, newPassword });
      setMessage(response.data.message || 'Contraseña restablecida exitosamente');
      setAnimDir('next');
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...codeDigits];
    next[index] = digit;
    setCodeDigits(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && codeDigits.every(Boolean)) {
      document.getElementById('fp-reset-btn')?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const next = [...codeDigits];
    paste.split('').forEach((d, i) => { next[i] = d; });
    setCodeDigits(next);
    const idx = Math.min(paste.length, 5);
    setTimeout(() => otpRefs.current[idx]?.focus(), 0);
  };

  const goToStep = (target, dir) => {
    setAnimDir(dir);
    setStep(target);
    setError('');
  };

  const stepLabels = ['Email', 'Método', 'Código'];
  const totalSteps = 3;

  const renderStepIndicator = () => (
    <div className="fp-steps">
      {stepLabels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = step >= stepNum + (step === 4 ? 1 : 0);
        const isCurrent = step === stepNum || (step === 4 && i === 2) || (step === 3 && i === 1);
        return (
          <React.Fragment key={label}>
            <div className={`fp-step ${isActive ? 'is-active' : ''} ${isCurrent ? 'is-current' : ''}`}>
              <div className="fp-step-dot">
                {isActive && stepNum < 3 ? <FiCheck size={14} /> : stepNum}
              </div>
              <span className="fp-step-label">{label}</span>
            </div>
            {i < 2 && (
              <div className={`fp-step-line ${isActive && stepNum < 3 ? 'is-filled' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderStep = (content) => (
    <div className={`fp-step-content ${animDir === 'prev' ? 'slide-in-left' : 'slide-in-right'}`}>
      {content}
    </div>
  );

  return (
    <div className="fp-root">
      <div className="fp-noise" />
      <div className="fp-glow" />
      <div className="fp-watermark">RENTUP</div>

      <div className="fp-card">
        <div className="fp-card-accent" />

        <div className="fp-card-header">
          <div className="fp-lock-icon">
            <FiShield />
          </div>
          <h1 className="fp-title">Recuperar contraseña</h1>
          <p className="fp-subtitle">Te guiaremos paso a paso</p>
        </div>

        {renderStepIndicator()}

        <div className="fp-anim-wrap">
          {step === 1 && renderStep(
            <form onSubmit={handleEmailSubmit} className="fp-form">
              <p className="fp-desc">
                Ingresa el correo electrónico con el que registraste tu cuenta en RentUp.
              </p>
              <div className="fp-field">
                <label className="fp-label" htmlFor="fp-email">
                  <FiMail size={14} /> Correo electrónico
                </label>
                <input
                  ref={emailRef}
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="fp-input"
                  autoComplete="email"
                />
              </div>
              {error && <div className="fp-alert fp-alert-error">{error}</div>}
              {message && <div className="fp-alert fp-alert-success"><FiCheck /> {message}</div>}
              <button
                type="submit"
                className="fp-btn fp-btn-primary"
                disabled={loading || !email.trim()}
              >
                {loading ? <span className="fp-spinner" /> : 'Continuar'}
              </button>
            </form>
          )}

          {step === 2 && renderStep(
            <div className="fp-form">
              <p className="fp-desc">
                ¿Cómo prefieres recibir tu código de verificación?
              </p>
              {error && <div className="fp-alert fp-alert-error">{error}</div>}
              <div className="fp-methods">
                <button
                  type="button"
                  className="fp-method-btn"
                  onClick={() => handleSendCode('email')}
                  disabled={loading}
                >
                  <div className="fp-method-icon">
                    <FiMail size={22} />
                  </div>
                  <span className="fp-method-label">Enviar por Email</span>
                  <span className="fp-method-hint">Llegará a tu bandeja de entrada</span>
                </button>
                {hasPhone && (
                  <button
                    type="button"
                    className="fp-method-btn"
                    onClick={() => handleSendCode('sms')}
                    disabled={loading}
                  >
                    <div className="fp-method-icon">
                      <FiPhone size={22} />
                    </div>
                    <span className="fp-method-label">Enviar por SMS</span>
                    <span className="fp-method-hint">Mensaje de texto a tu celular</span>
                  </button>
                )}
              </div>
              {!hasPhone && (
                <p className="fp-info">
                  No tienes un número telefónico registrado. Solo disponible por correo electrónico.
                </p>
              )}
              <button
                type="button"
                className="fp-btn fp-btn-ghost"
                onClick={() => goToStep(1, 'prev')}
              >
                <FiArrowLeft size={14} /> Volver
              </button>
            </div>
          )}

          {step === 3 && renderStep(
            <form onSubmit={handlePhoneSubmit} className="fp-form">
              <p className="fp-desc">
                Ingresa el número de teléfono que registraste en tu cuenta.
              </p>
              {error && <div className="fp-alert fp-alert-error">{error}</div>}
              <div className="fp-field">
                <label className="fp-label" htmlFor="fp-phone">
                  <FiPhone size={14} /> Número de teléfono
                </label>
                <input
                  id="fp-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="300 123 4567"
                  required
                  className="fp-input"
                  autoFocus
                />
                <span className="fp-hint">
                  Incluye el código de país o lo agregaremos automáticamente
                </span>
              </div>
              <button
                type="submit"
                className="fp-btn fp-btn-primary"
                disabled={loading || !phoneNumber.trim()}
              >
                {loading ? <span className="fp-spinner" /> : 'Enviar código SMS'}
              </button>
              <button
                type="button"
                className="fp-btn fp-btn-ghost"
                onClick={() => goToStep(2, 'prev')}
              >
                <FiArrowLeft size={14} /> Volver
              </button>
            </form>
          )}

          {step === 4 && renderStep(
            <form onSubmit={handleResetPassword} className="fp-form">
              <p className="fp-desc">
                Ingresa el código de verificación que recibiste y tu nueva contraseña.
              </p>
              {message && <div className="fp-alert fp-alert-success"><FiCheck /> {message}</div>}
              {error && <div className="fp-alert fp-alert-error">{error}</div>}

              <div className="fp-field">
                <label className="fp-label">Código de verificación</label>
                <div className="fp-otp-group">
                  {codeDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className="fp-otp-input"
                      autoComplete="one-time-code"
                      aria-label={`Digito ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="fp-field">
                <label className="fp-label" htmlFor="fp-newpass">Nueva contraseña</label>
                <div className="fp-input-wrap">
                  <input
                    id="fp-newpass"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="fp-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="fp-toggle-pass"
                    onClick={() => setShowPassword((p) => !p)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="fp-field">
                <label className="fp-label" htmlFor="fp-confpass">Confirmar contraseña</label>
                <div className="fp-input-wrap">
                  <input
                    id="fp-confpass"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    required
                    className="fp-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="fp-toggle-pass"
                    onClick={() => setShowConfirm((p) => !p)}
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                id="fp-reset-btn"
                type="submit"
                className="fp-btn fp-btn-primary"
                disabled={loading || codeDigits.some((d) => !d) || !newPassword.trim() || !confirmPassword.trim()}
              >
                {loading ? <span className="fp-spinner" /> : 'Restablecer contraseña'}
              </button>

              <button
                type="button"
                className="fp-btn fp-btn-ghost"
                onClick={() => {
                  setCodeDigits(Array(6).fill(''));
                  setNewPassword('');
                  setConfirmPassword('');
                  goToStep(hasPhone ? 2 : 1, 'prev');
                }}
              >
                <FiArrowLeft size={14} /> Volver
              </button>
            </form>
          )}

          {step === 5 && renderStep(
            <div className="fp-form fp-success">
              <div className="fp-success-ring">
                <div className="fp-check-icon">
                  <FiCheck size={32} />
                </div>
              </div>
              <h2 className="fp-success-title">¡Contraseña restablecida!</h2>
              <p className="fp-desc">
                Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva clave.
              </p>
              <Link to="/login" className="fp-btn fp-btn-primary">
                Ir al inicio de sesión
              </Link>
            </div>
          )}
        </div>

        <div className="fp-footer">
          <Link to="/login" className="fp-back-link">
            <FiArrowLeft size={13} /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
