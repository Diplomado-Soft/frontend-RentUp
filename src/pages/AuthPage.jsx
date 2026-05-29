import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SucessModal from '../components/SuccessModal';
import { loginUser } from '../apis/loginController';
import { signupUser } from '../apis/signupController';
import { UserContext } from "../contexts/UserContext";
import { firebaseGoogleSignIn } from "../apis/firebaseAuthService";
import axiosInstance from "../contexts/axiosInstance";
import { auth } from "../firebaseConfig";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const location = useLocation();

  const goToHome = () => navigate("/");

  useEffect(() => {
    const tab = location.pathname === "/signup" ? "signup" : "login";
    setActiveTab(tab);
    document.title = tab === "login" ? "Iniciar Sesión | RentUp" : "Registrarse | RentUp";
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    navigate(tab === "login" ? "/login" : "/signup", { replace: true });
  };

  return (
    <div className="min-h-screen screen-enter flex items-center justify-center p-4 md:p-8 bg-paper-sunk/50 relative overflow-hidden">
      {/* Gridbg backdrop */}
      <div className="absolute inset-0 gridbg opacity-40 pointer-events-none" />

      {/* Volver al inicio */}
      <button
        onClick={goToHome}
        className="absolute top-6 left-6 text-sm text-ink-muted hover:text-ink flex items-center gap-1.5 z-10"
      >
        <span className="material-symbols-outlined text-sm">arrow_back_ios</span> Volver al inicio
      </button>
      {/* Logo mobile */}
      <div className="absolute top-6 right-6 z-10 hidden md:block">
        <span className="font-display italic-serif text-xl text-ink">RentUP</span>
      </div>

      {/* Card container */}
      <div className="rcard bg-paper-card w-full max-w-[1080px] grid grid-cols-1 md:grid-cols-2 overflow-hidden relative" style={{ '--radius-card': '28px', '--card-shadow': '0 30px 80px -30px rgba(14,26,43,0.35), 0 0 0 1px rgba(14,26,43,0.05)', '--card-border': '1px solid transparent', minHeight: '720px' }}>

        {/* LEFT — Brand blob */}
        <section className="hidden md:flex relative flex-col items-center justify-center overflow-hidden min-h-[720px]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bg-brand-500 rounded-[50%]" style={{ width: '170%', height: '160%', left: '-35%', top: '-30%' }} />
            <div className="absolute rounded-[50%] bg-brand-400/40" style={{ width: '60%', height: '50%', left: '15%', top: '25%', filter: 'blur(50px)' }} />
          </div>
          <div className="relative z-10 text-center px-8 md:px-12 max-w-sm text-paper">
            <h2 className="font-display text-4xl md:text-5xl leading-none">
              {activeTab === "login" ? '¡Hola!' : '¡Bienvenido!'}
            </h2>
            <p className="mt-5 text-paper/85 leading-relaxed text-sm">
              {activeTab === "login"
                ? 'Si aún no tenés una cuenta, creala en menos de 2 minutos.'
                : 'Registrate con tus datos personales para usar todas las funciones de RentUP.'}
            </p>
            <button
              onClick={() => navigate(activeTab === "login" ? "/role-selection" : "/login")}
              className="mt-8 px-10 py-3 rounded-full border-2 border-paper text-paper font-semibold tracking-wide hover:bg-paper hover:text-brand-500 transition-colors text-sm"
            >
              {activeTab === "login" ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </div>
        </section>

        {/* RIGHT — Form */}
        <section className="flex items-center justify-center p-6 md:p-10 overflow-y-auto">
          <div className="w-full max-w-sm">
            {/* Mobile branding + back */}
            <div className="flex items-center justify-between md:hidden mb-6">
              <button onClick={goToHome} className="text-ink-muted hover:text-ink">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <span className="font-display italic-serif text-lg text-ink">RentUP</span>
              <div className="w-6" />
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-ink text-center">
              {activeTab === "login" ? 'Iniciar Sesión' : 'Registrarse'}
            </h1>

            {activeTab === "login" ? (
              <LoginForm />
            ) : (
              <SignupForm />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* =====================================================================
   LoginForm — ALL logic from Login.jsx, untouched
   ===================================================================== */
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const goToHome = () => navigate("/");

  const handlePendingProperty = () => {
    const id = localStorage.getItem("pendingPropertyId");
    if (id) {
      localStorage.setItem("openPropertyModal", id);
      localStorage.removeItem("pendingPropertyId");
      localStorage.removeItem("pendingPropertyTitle");
    }
  };

  useEffect(() => {
    if (location.state?.errorMsg) setMessage(location.state.errorMsg);
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginUser({ email, password, login });
      if (result.success) {
        handlePendingProperty();
        goToHome();
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage(error.message || "Error al iniciar sesión");
    }
  };

  const handleGoogleClick = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const result = await firebaseGoogleSignIn();
      if (result.requiresRoleSelection || !result.user?.rol) {
        localStorage.setItem("pendingGoogleUser", JSON.stringify(result.user));
        setShowRoleModal(true);
      } else {
        const userWithToken = { ...result.user, token: result.token };
        login(userWithToken);
        handlePendingProperty();
        goToHome();
      }
    } catch (error) {
      setMessage(error.message || "Error Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    const googleUserData = localStorage.getItem("pendingGoogleUser");
    if (!googleUserData) {
      setMessage("Error datos Google");
      setShowRoleModal(false);
      return;
    }
    const user = JSON.parse(googleUserData);
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setMessage("Sesion de Google no disponible");
      setShowRoleModal(false);
      return;
    }
    let refreshToken;
    try {
      refreshToken = await firebaseUser.getIdToken(true);
    } catch (error) {
      setMessage("Error de autenticacion");
      setShowRoleModal(false);
      return;
    }
    const rolId = role === "arrendador" ? 2 : 1;
    try {
      const response = await axiosInstance.post(`/auth/firebase-login`, {
        firebaseToken: refreshToken,
        rolId,
      });
      if (response.status === 200) {
        const { token, user: userData } = response.data;
        if (token && userData) {
          const userWithToken = { ...userData, token };
          login(userWithToken);
          localStorage.removeItem("pendingGoogleUser");
          handlePendingProperty();
          goToHome();
        }
      } else {
        setMessage("Error al completar el registro");
        setShowRoleModal(false);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error al completar el registro");
      setShowRoleModal(false);
    }
  };

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {/* Email — pill input */}
        <div>
          <label className="text-xs text-ink-muted font-medium mb-1.5 block" htmlFor="email">Correo Electrónico</label>
          <div className="flex items-center gap-3 bg-paper-sunk/80 rounded-full px-5 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
            <span className="material-symbols-outlined text-ink-muted text-sm flex-shrink-0">mail</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@universidad.edu"
              className="bg-transparent outline-none w-full text-sm py-3 placeholder:text-ink-muted/60 text-ink"
            />
          </div>
        </div>

        {/* Password — pill input */}
        <div>
          <label className="text-xs text-ink-muted font-medium mb-1.5 block" htmlFor="password">Contraseña</label>
          <div className="flex items-center gap-3 bg-paper-sunk/80 rounded-full px-5 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
            <span className="material-symbols-outlined text-ink-muted text-sm flex-shrink-0">lock</span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-transparent outline-none w-full text-sm py-3 placeholder:text-ink-muted/60 text-ink"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-ink-muted hover:text-ink transition-colors flex-shrink-0">
              <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-line text-brand-500 focus:ring-brand-500/30 h-4 w-4 cursor-pointer" />
            <span className="text-ink-muted">Recordarme</span>
          </label>
          <span onClick={() => navigate("/forgot-password")} className="text-brand-500 hover:text-brand-700 font-medium cursor-pointer">¿Olvidaste tu contraseña?</span>
        </div>

        {/* Error message */}
        {message && (
          <div className="bg-error-container/50 rounded-full px-5 py-2.5 flex items-center gap-2 text-sm">
            <p className="text-error font-medium">{message}</p>
          </div>
        )}

        {/* Submit — pill button */}
        <button type="submit" className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-700 text-paper font-semibold tracking-[0.18em] text-sm transition-colors">
          INGRESAR
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px bg-line flex-1" />
          <span className="text-[10px] text-ink-muted">O continúa con</span>
          <div className="h-px bg-line flex-1" />
        </div>

        {/* Google — full width pill */}
        <button type="button" onClick={handleGoogleClick} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-line text-ink-muted hover:text-ink hover:border-ink transition-colors text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>{isLoading ? "Autenticando..." : "Entrar con Google"}</span>
        </button>

        <p className="text-[10px] text-ink-muted text-center mt-6">
          ¿Problemas para acceder?{" "}
          <span className="text-brand-500 hover:text-brand-700 font-medium cursor-pointer underline">Contacta con soporte</span>
        </p>
      </form>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowRoleModal(false)}>
          <div className="bg-paper w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-brand-500 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Selecciona tu tipo de cuenta</h3>
                  <p className="text-white/80 text-sm">para continuar con Google</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-ink-muted text-sm text-center mb-4">¿Cómo usarás la plataforma? Selecciona una opción:</p>
              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedRole === "usuario" ? "border-brand-500 bg-brand-500/10 shadow-lg" : "border-line hover:border-line hover:shadow-md"}`}
                onClick={() => handleRoleSelect("usuario")}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole === "usuario" ? "bg-brand-500 text-white" : "bg-line/30 text-ink-muted"}`}>
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink">Usuario</h4>
                    <p className="text-ink-muted text-sm">Busco alquilar un apartamento</p>
                  </div>
                </div>
              </div>
              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedRole === "arrendador" ? "border-brand-500 bg-brand-500/10 shadow-lg" : "border-line hover:border-line hover:shadow-md"}`}
                onClick={() => handleRoleSelect("arrendador")}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole === "arrendador" ? "bg-brand-500 text-white" : "bg-line/30 text-ink-muted"}`}>
                    <span className="material-symbols-outlined text-xl">business</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink">Arrendador</h4>
                    <p className="text-ink-muted text-sm">Tengo propiedades para alquilar</p>
                  </div>
                </div>
              </div>
              <button
                className="w-full py-3 bg-line/30 text-ink-muted font-semibold rounded-xl hover:bg-line/40 transition-colors"
                onClick={() => setShowRoleModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =====================================================================
   SignupForm — ALL logic from Signup.jsx, untouched
   ===================================================================== */
function SignupForm() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idDocumentFile, setIdDocumentFile] = useState(null);
  const [mensaje, setMessage] = useState("");
  const [showSucess, setShowSucess] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [error, setError] = useState(false);
  const { login } = useContext(UserContext);
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.role) {
      setUserType(location.state.role);
    }
  }, [location]);

  const goToHome = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!telefono || telefono.trim() === "") {
      setError(true);
      setMessage("El número de teléfono es obligatorio");
      return;
    }

    const cleanPhone = telefono.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 12) {
      setError(true);
      setMessage("Ingresa un número de teléfono válido (10-12 dígitos)");
      return;
    }

    if (password !== confirmPassword) {
      setError(true);
      setMessage("Las contraseñas no coinciden");
      return;
    }

    let rolId = 2;
    if (userType === "usuario") {
      rolId = 1;
    }

    if (!userType) {
      setError(true);
      setMessage("Por favor selecciona un tipo de usuario.");
      return;
    }

    if (rolId === 2 && !idDocumentFile) {
      setError(true);
      setMessage("Para registrarte como arrendador debes subir una foto de tu cédula de identidad.");
      return;
    }

    const result = await signupUser({ nombre, apellido, email, telefono, password, rolId, id_document: idDocumentFile }, login);
    if (result.success) {
      setShowSucess(true);
    } else {
      setMessage(result.message);
      setError(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSucess(false);
    navigate("/");
  };

  const handleGoogleSignIn = async () => {
    if (!userType) {
      setError(true);
      setMessage("Por favor selecciona un tipo de usuario antes de continuar con Google");
      return;
    }

    try {
      const rolId = userType === "usuario" ? 1 : 2;
      const result = await firebaseGoogleSignIn(rolId);

      if (result.success) {
        setPendingUser(result.user);
        const userWithToken = { ...result.user, token: result.token };
        login(userWithToken);

        if (!result.user.telefono && !result.user.whatsapp) {
          setShowPhoneModal(true);
        } else {
          setShowSucess(true);
        }
      } else {
        setError(true);
        setMessage(result.error || "Error al autenticar");
      }
    } catch (error) {
      setError(true);
      setMessage(error.message || "Error al autenticar con Google");
    }
  };

  const handlePhoneSubmit = async () => {
    const cleanPhone = telefono.replace(/\D/g, "");
    const cleanWhatsApp = whatsapp.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      setError(true);
      setMessage("El número de teléfono es obligatorio (mínimo 10 dígitos)");
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const token = userData?.token;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:9000"}/users/update-whatsapp`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            telefono: cleanPhone,
            whatsapp: cleanWhatsApp || cleanPhone,
          }),
        }
      );

      if (response.ok) {
        if (pendingUser) {
          const updatedUser = {
            ...pendingUser,
            telefono: cleanPhone,
            whatsapp: cleanWhatsApp || cleanPhone,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          login(updatedUser);
        }
        setShowPhoneModal(false);
        setShowSucess(true);
      } else {
        setError(true);
        setMessage("Error al guardar el número de teléfono");
      }
    } catch (error) {
      setError(true);
      setMessage("Error al guardar el número de teléfono");
    }
  };

  const handleRoleChange = (role) => {
    setUserType(role);
    if (role === "usuario" || role === "arrendador") {
      setMessage("");
      setError(false);
    }
  };

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {/* Role Selection — pill toggle */}
        <div>
          <label className="text-xs text-ink-muted font-medium mb-1.5 block">¿Cómo te unes?</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted/70">Soy</span>
            <div className="inline-flex bg-paper-sunk rounded-full p-1 gap-0">
              {[
                { id: "usuario", label: "inquilino" },
                { id: "arrendador", label: "propietario" },
              ].map((r) => (
                <label key={r.id} className="cursor-pointer">
                  <input
                    checked={userType === r.id}
                    className="hidden peer"
                    name="role"
                    type="radio"
                    value={r.id}
                    onChange={() => handleRoleChange(r.id)}
                  />
                  <span className="px-3.5 py-1 rounded-full text-xs font-semibold transition-colors peer-checked:bg-ink peer-checked:text-paper text-ink-muted hover:text-ink">
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Name Grid — pill inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink-muted font-medium mb-1.5 block" htmlFor="auth-nombre">Nombre</label>
            <div className="flex items-center gap-3 bg-paper-sunk/80 rounded-full px-5 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
              <span className="material-symbols-outlined text-ink-muted text-sm flex-shrink-0">person</span>
              <input
                id="auth-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan"
                className="bg-transparent outline-none w-full text-sm py-3 placeholder:text-ink-muted/60 text-ink"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-ink-muted font-medium mb-1.5 block" htmlFor="auth-apellido">Apellido</label>
            <div className="flex items-center gap-3 bg-paper-sunk/80 rounded-full px-5 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
              <span className="material-symbols-outlined text-ink-muted text-sm flex-shrink-0">badge</span>
              <input
                id="auth-apellido"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej. Pérez"
                className="bg-transparent outline-none w-full text-sm py-3 placeholder:text-ink-muted/60 text-ink"
              />
            </div>
          </div>
        </div>

        {/* Email — pill input */}
        <div>
          <label className="text-xs text-ink-muted font-medium mb-1.5 block" htmlFor="auth-email">Email</label>
          <div className="flex items-center gap-3 bg-paper-sunk/80 rounded-full px-5 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
            <span className="material-symbols-outlined text-ink-muted text-sm flex-shrink-0">mail</span>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@universidad.edu"
              className="bg-transparent outline-none w-full text-sm py-3 placeholder:text-ink-muted/60 text-ink"
            />
          </div>
        </div>

        {/* Phone — pill input */}
        <div>
          <label className="text-xs text-ink-muted font-medium mb-1.5 block" htmlFor="auth-telefono">Teléfono</label>
          <div className="flex items-center gap-3 bg-paper-sunk/80 rounded-full px-5 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
            <span className="material-symbols-outlined text-ink-muted text-sm flex-shrink-0">phone</span>
            <input
              id="auth-telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+57 300 123 4567"
              className="bg-transparent outline-none w-full text-sm py-3 placeholder:text-ink-muted/60 text-ink"
            />
          </div>
        </div>

        {/* Password Grid — pill inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink-muted font-medium mb-1.5 block" htmlFor="auth-password">Contraseña</label>
            <div className="flex items-center gap-3 bg-paper-sunk/80 rounded-full px-5 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
              <span className="material-symbols-outlined text-ink-muted text-sm flex-shrink-0">lock</span>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-sm py-3 placeholder:text-ink-muted/60 text-ink"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-ink-muted font-medium mb-1.5 block" htmlFor="auth-confirm-password">Confirmar Contraseña</label>
            <div className="flex items-center gap-3 bg-paper-sunk/80 rounded-full px-5 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
              <span className="material-symbols-outlined text-ink-muted text-sm flex-shrink-0">lock</span>
              <input
                id="auth-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-sm py-3 placeholder:text-ink-muted/60 text-ink"
              />
            </div>
          </div>
        </div>

        {/* Cédula upload — solo para arrendador */}
        {userType === "arrendador" && (
          <div>
            <label className="text-xs text-ink-muted font-medium mb-1.5 block">Cédula de Identidad *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#5849E4]/40 transition relative text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setIdDocumentFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {idDocumentFile ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[#5849E4]">description</span>
                  <span className="text-sm font-medium text-ink truncate max-w-[200px]">{idDocumentFile.name}</span>
                  <button type="button" onClick={(e) => { e.preventDefault(); setIdDocumentFile(null); }} className="text-red-500 text-xs hover:underline">Quitar</button>
                </div>
              ) : (
                <div>
                  <span className="material-symbols-outlined text-2xl text-gray-400">upload</span>
                  <p className="text-xs text-gray-400 mt-1">Sube tu cédula (JPG, PNG o PDF)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-error-container/50 rounded-full px-5 py-2.5 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-error text-sm">warning</span>
            <p className="text-error font-medium">{mensaje}</p>
          </div>
        )}

        {/* Submit — pill button */}
        <div className="pt-1 space-y-3">
          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-700 text-paper font-semibold tracking-[0.18em] text-sm transition-colors"
          >
            REGISTRARSE
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-line flex-1" />
            <span className="text-[10px] text-ink-muted">o registrate con</span>
            <div className="h-px bg-line flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-line text-ink-muted hover:text-ink hover:border-ink transition-colors text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>

        <p className="text-[10px] text-ink-muted text-center">
          Al registrarte, aceptas nuestros{" "}
          <span className="text-brand-500 hover:text-brand-700 font-medium cursor-pointer underline">Términos de Servicio</span>{" "}
          y <span className="text-brand-500 hover:text-brand-700 font-medium cursor-pointer underline">Política de Privacidad</span>.
        </p>
      </form>

      {showSucess && <SucessModal message={"Registro Exitoso."} goToLogin={handleSuccessClose} />}

      {/* Phone Modal */}
      {showPhoneModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-paper w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-line">
            <div className="bg-brand-500 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <span className="material-symbols-outlined text-white text-lg">phone</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Completa tu registro</h3>
                  <p className="text-white/80 text-sm">Ingresa tu número de contacto</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-brand-500 text-2xl">phone</span>
                </div>
                <p className="text-ink-muted text-sm">
                  Para poder contactarte con arrendadores y recibir notificaciones,
                  necesitamos tu número de teléfono.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-ink text-sm font-semibold">Teléfono *</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="300 123 4567"
                  className="w-full bg-paper-sunk border-none rounded-lg p-4 focus:ring-2 focus:ring-brand-500 transition-shadow placeholder:text-ink/40 text-body-md text-ink"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-ink text-sm font-semibold">WhatsApp (opcional)</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="300 123 4567"
                  className="w-full bg-paper-sunk border-none rounded-lg p-4 focus:ring-2 focus:ring-brand-500 transition-shadow placeholder:text-ink/40 text-body-md text-ink"
                />
                <p className="text-ink-muted text-xs">Si es diferente al teléfono principal</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">warning</span>
                  <p className="text-red-600 text-sm">{mensaje}</p>
                </div>
              )}

              <button
                className="w-full py-3 bg-brand-500 hover:bg-brand-500/90 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                onClick={handlePhoneSubmit}
              >
                <span className="material-symbols-outlined">check_circle</span>
                <span>Continuar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AuthPage;
