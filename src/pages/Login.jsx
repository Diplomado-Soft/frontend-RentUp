import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../apis/loginController";
import { firebaseGoogleSignIn } from "../apis/firebaseAuthService";
import { UserContext } from "../contexts/UserContext";
import axiosInstance from "../contexts/axiosInstance";
import { auth } from "../firebaseConfig";

function Login() {
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
          localStorage.setItem('pendingGoogleUser', JSON.stringify(result.user));
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
    if(!firebaseUser) {
      setMessage("Sesion de Google no disponible");
      setShowRoleModal(false);
      return;
    }
    let refreshToken;
    try {
      refreshToken = await firebaseUser.getIdToken(true);
    } catch (error) {
      setMessage("Error de autenticacion")
      setShowRoleModal(false);
      return;
    }
    const rolId = role === "arrendador" ? 2 : 1;
     try {
       const response = await axiosInstance.post(`/auth/firebase-login`, {
         firebaseToken: refreshToken,
         rolId,
         email: user.email,
         nombre: user.nombre || user.email,
         apellido: user.apellido || '',
         photoURL: user.photoURL || null,
       });
       if (response.data.success) {
         localStorage.removeItem("pendingGoogleUser");
         setShowRoleModal(false);
         const userWithToken = { ...response.data.user, token: response.data.token };
         login(userWithToken);
         handlePendingProperty();
         goToHome();
       } else {
         setMessage(response.data.message || "Error registro");
       }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error completar");
    } finally {
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-surface">
      {/* Left Side - Purple Brand Section */}
      <section className="hidden md:flex relative w-1/2 flex-col justify-center items-center p-8 overflow-hidden bg-gradient-to-br from-primary via-primary-container to-[#3a23c8]">
        <div className="absolute inset-0 z-0 opacity-40">
          <img alt="Ilustración de RentUp" className="w-full h-full object-cover mix-blend-overlay" src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" />
        </div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl opacity-30" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl opacity-20" />
        <div className="relative z-10 max-w-md text-center text-on-primary">
          <h1 className="font-headline text-headline-lg mb-4 leading-tight">
            Bienvenido a RentUp
          </h1>
          <p className="text-body-md text-on-primary/90 px-8">
            Encuentra el hogar perfecto para tu etapa universitaria. Conectamos estudiantes con las mejores opciones de vivienda.
          </p>
        </div>
      </section>

      {/* Right Side - Clean Login Form */}
      <section className="flex-1 flex flex-col justify-center items-center p-4 bg-surface-container-lowest min-h-screen">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="md:hidden mb-6 text-center">
            <span className="font-headline text-headline-md text-primary font-bold">RentUp</span>
          </div>

          <div className="bg-surface-container-lowest p-6">
            {/* Tab Selector */}
            <div className="flex border-b border-surface-variant mb-8">
              <button className="flex-1 pb-4 text-center border-b-2 border-primary text-primary font-bold text-label-md uppercase tracking-wider">
                Iniciar Sesión
              </button>
              <button onClick={() => navigate('/signup')} className="flex-1 pb-4 text-center border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-colors text-label-md uppercase tracking-wider">
                Crear Cuenta
              </button>
            </div>

            <h2 className="font-headline text-headline-md mb-8 text-on-surface">Hola de nuevo</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-1">
                <label className="text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="email">Correo Electrónico</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@universidad.edu"
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="password">Contraseña</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary-container h-5 w-5 cursor-pointer" />
                  <span className="text-label-md text-on-surface-variant group-hover:text-on-surface">Recordarme</span>
                </label>
                <span onClick={() => navigate("/forgot-password")} className="text-label-md text-primary hover:underline cursor-pointer transition-all">¿Olvidaste tu contraseña?</span>
              </div>

              {/* Error message */}
              {message && (
                <div className="bg-error-container/50 rounded-lg p-3 flex items-center gap-2">
                  <p className="text-error text-sm font-medium">{message}</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-label-md uppercase tracking-wider">
                Iniciar Sesión
              </button>

              {/* Divider */}
              <div className="relative py-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-variant"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface-container-lowest px-4 text-outline text-label-md uppercase">O continúa con</span>
                </div>
              </div>

              {/* Google */}
              <button type="button" onClick={handleGoogleClick} disabled={isLoading} className="flex items-center justify-center gap-4 w-full py-3 px-4 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-on-surface-variant group-hover:text-on-surface text-label-md">{isLoading ? "Autenticando..." : "Entrar con Google"}</span>
              </button>
            </form>

            <p className="mt-8 text-center text-label-md text-on-surface-variant">
              ¿Problemas para acceder?{" "}
              <span className="text-primary hover:underline cursor-pointer">Contacta con soporte</span>
            </p>
          </div>
        </div>
      </section>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowRoleModal(false)}>
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-primary-gradient px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Selecciona tu tipo de cuenta</h3>
                  <p className="text-white/80 text-sm">para continuar con Google</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-on-surface-variant text-sm text-center mb-4">¿Cómo usarás la plataforma? Selecciona una opción:</p>
              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedRole === 'usuario' ? 'border-primary bg-primary-50 shadow-lg' : 'border-surface-container-high hover:border-outline hover:shadow-md'}`} onClick={() => handleRoleSelect('usuario')} disabled={isLoading}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole === 'usuario' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-surface">Usuario</h4>
                    <p className="text-on-surface-variant text-sm">Busco alquilar un apartamento</p>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedRole === 'arrendador' ? 'border-primary bg-primary-50 shadow-lg' : 'border-surface-container-high hover:border-outline hover:shadow-md'}`} onClick={() => handleRoleSelect('arrendador')} disabled={isLoading}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole === 'arrendador' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-xl">business</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-surface">Arrendador</h4>
                    <p className="text-on-surface-variant text-sm">Tengo propiedades para alquilar</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-3 bg-surface-container-high text-on-surface-variant font-semibold rounded-xl hover:bg-surface-container-highest transition-colors" onClick={() => setShowRoleModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
