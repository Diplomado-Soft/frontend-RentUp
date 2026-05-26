import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiCheck, FiArrowLeft, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import axiosInstance from '../contexts/axiosInstance';
import './ResetPassword.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [codeDigits, setCodeDigits] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (token && token.length >= 6) {
      const digits = token.replace(/\D/g, '').slice(0, 6).split('');
      const filled = Array(6).fill('');
      digits.forEach((d, i) => { filled[i] = d; });
      setCodeDigits(filled);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = codeDigits.join('');
    if (code.length < 6 || !newPassword) {
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
      const response = await axiosInstance.post('/auth/reset-password', { code, newPassword });
      setMessage(response.data.message || 'Contraseña restablecida exitosamente');
      setCodeSent(true);
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
      document.getElementById('rp-submit-btn')?.focus();
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

  return (
    <div className="rp-root">
      <div className="fp-noise" />
      <div className="fp-glow" />
      <div className="fp-watermark">RENTUP</div>

      <div className="rp-card">
        <div className="fp-card-accent" />

        <div className="rp-card-header">
          <div className="fp-lock-icon">
            <FiShield />
          </div>
          <h1 className="fp-title">Restablecer contraseña</h1>
          <p className="fp-subtitle">Ingresa el código y tu nueva clave</p>
        </div>

        {message && (
          <div className="rp-msg-area">
            <div className="fp-alert fp-alert-success">
              <FiCheck /> {message}
            </div>
            <Link to="/login" className="fp-btn fp-btn-primary rp-login-btn">
              Ir al inicio de sesión
            </Link>
          </div>
        )}

        {error && (
          <div className="rp-msg-area">
            <div className="fp-alert fp-alert-error">{error}</div>
          </div>
        )}

        {!codeSent && (
          <div className="rp-form-wrap">
            <form onSubmit={handleSubmit} className="rp-form">
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
                <label className="fp-label" htmlFor="rp-newpass">Nueva contraseña</label>
                <div className="fp-input-wrap">
                  <input
                    id="rp-newpass"
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
                <label className="fp-label" htmlFor="rp-confpass">Confirmar contraseña</label>
                <div className="fp-input-wrap">
                  <input
                    id="rp-confpass"
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
                id="rp-submit-btn"
                type="submit"
                className="fp-btn fp-btn-primary"
                disabled={loading || codeDigits.some((d) => !d) || !newPassword.trim() || !confirmPassword.trim()}
              >
                {loading ? <span className="fp-spinner" /> : 'Restablecer contraseña'}
              </button>
            </form>
          </div>
        )}

        <div className="rp-footer">
          <Link to="/login" className="fp-back-link">
            <FiArrowLeft size={13} /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
