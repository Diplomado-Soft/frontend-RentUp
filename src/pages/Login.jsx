import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../apis/loginController";
import { firebaseGoogleSignIn } from "../apis/firebaseAuthService";
import { UserContext } from "../contexts/UserContext";
import axiosInstance from "../contexts/axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEnvelope, faLock, faHome, faShieldAlt, faUserCheck, faBolt, faHandPaper, faExclamationTriangle, faCheckCircle, faUser, faBuilding, faL } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { auth } from "../firebaseConfig";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  // ← ELIMINADO: isVerifying obsoleto
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const goToHome = () => navigate("/");

  // modal
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
    const result = await loginUser({ email, password, login });
    if (result.success) {
      handlePendingProperty();  // ← UNA LLAMADA
      goToHome();
    } else {
      setMessage(result.message);
    }
  };

  // GOOGLE LOGIN: Maneja nueva + reactivada sin rol
  const handleGoogleClick = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      console.log("🔄 Google login...");
      const result = await firebaseGoogleSignIn();
      console.log("Backend:", result);
      
       // Modal si: nueva cuenta O reactivada sin rol
       if (result.requiresRoleSelection || !result.user?.rol) {
 console.log("👤 Mostrar modal (nueva/reactivada)");
         localStorage.setItem('pendingGoogleUser', JSON.stringify(result.user));
         setShowRoleModal(true);
       } else {
         console.log("Login directo");
         // Asegurar que el token esté en el objeto user
         const userWithToken = { ...result.user, token: result.token };
         login(userWithToken);
         handlePendingProperty();
         goToHome();
       }
    } catch (error) {
      console.error("❌ Error:", error);
      setMessage(error.message || "Error Google");
    } finally {
      setIsLoading(false);
    }
  };

  // SELECCIÓN ROL: Completar con rolId
  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    const googleUserData = localStorage.getItem("pendingGoogleUser");
    if (!googleUserData) {
      setMessage("Error datos Google");
      setShowRoleModal(false);
      return;
    }
    const user = JSON.parse(googleUserData);

    //REFRESCAR TOKEN
    const firebaseUser = auth.currentUser;
    if(!firebaseUser) {
      setMessage("Sesion de Google no disponible");
      setShowRoleModal(false);
      return;
    }
    let refreshToken;
    try {
      refreshToken = await firebaseUser.getIdToken(true); //feurza renovacion
    } catch (error) {
      console.log("Error al refrescar Token de Firebase", error);
      setMessage("Error de autenticacion")
      setShowRoleModal(false);
      return;
    }

    const rolId = role === "arrendador" ? 2 : 1;  // 1=usuario, 2=propietario
    
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
         // Asegurar que el token esté en el objeto user
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
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.2fr] grid-cols-1 items-center bg-gradient-to-br from-surface-800 via-surface-700 to-surface-900 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Exit Button */}
      <button
        onClick={goToHome}
        className="fixed top-6 right-6 w-12 h-12 rounded-full cursor-pointer text-white bg-white/10 backdrop-blur-md z-50 hover:bg-white/20 hover:rotate-90 hover:scale-110 transition-all duration-300 flex items-center justify-center border border-white/20 shadow-xl"
        aria-label="Volver al inicio"
      >
        <FontAwesomeIcon icon={faTimes} className="text-xl font-bold" />
      </button>

      {/* Visual Section - Izquierda */}
      <div className="hidden lg:flex h-screen bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center px-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 border border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="text-white max-w-xl space-y-8 animate-fade-in-up relative z-10">
          {/* Icon */}
          <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6 border border-white/30">
            <FontAwesomeIcon icon={faHome} className="text-4xl text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Tu nueva aventura comienza aquí
          </h1>
          <p className="text-white/80 text-xl leading-relaxed">
            Encuentra el espacio perfecto para tu etapa universitaria con total tranquilidad
          </p>

          {/* Features */}
          <div className="space-y-5 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <FontAwesomeIcon icon={faShieldAlt} className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Seguridad Garantizada</h3>
                <p className="text-white/70 text-sm">Propiedades verificadas por nuestro equipo</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <FontAwesomeIcon icon={faUserCheck} className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Profesionales Certificados</h3>
                <p className="text-white/70 text-sm">Arrendadores con excelente reputación</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <FontAwesomeIcon icon={faBolt} className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Búsqueda Inteligente</h3>
                <p className="text-white/70 text-sm">Encuentra tu hogar ideal en minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container - Derecha */}
      <div className="bg-white h-screen flex flex-col justify-center px-8 lg:px-16 shadow-2xl relative overflow-y-auto">
        <div className="max-w-md mx-auto w-full space-y-6">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FontAwesomeIcon icon={faHome} className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-surface-800 mb-3">
              Bienvenido de nuevo <FontAwesomeIcon icon={faHandPaper} className="ml-2 text-surface-600" />
            </h2>
            <p className="text-surface-500 text-base">
              Ingresa tus credenciales para continuar
            </p>
          </div>

{/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white hover:bg-surface-50 text-surface-700 font-semibold rounded-xl transition-all duration-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 border-2 border-surface-200 hover:border-primary-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg height="20" width="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path fill="#1F2937" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#3B82F6" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#34A853" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#FBBC05" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? "Autenticando..." : "Continuar con Google"}
          </button>

          {/* Separator */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-surface-200"></div>
            <span className="px-4 text-surface-400 text-sm font-medium">o ingresa con tu correo</span>
            <div className="flex-1 h-px bg-surface-200"></div>
          </div>

          {/* Inputs */}
          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-surface-700 text-sm font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-surface-400" />
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-surface-700 text-sm font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faLock} className="text-surface-400" />
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            {/* Error Message */}
            {message && (
              <div className="bg-red-50 border-2 border-red-100 rounded-xl p-4 flex items-center gap-3 animate-shake">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-lg" />
                <p className="text-red-600 font-medium text-sm">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group mt-6"
            >
              <span>Iniciar Sesión</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
            </button>
       <p className="text-surface-500 text-center pt-4">
         ¿No tienes cuenta?{" "}
         <span
           onClick={() => navigate("/signup")}
           className="text-primary-600 font-semibold cursor-pointer hover:text-primary-700 hover:underline transition-colors"
         >
           Regístrate aquí
         </span>
       </p>
       <p className="text-center pt-2">
         <span
           onClick={() => navigate("/forgot-password")}
           className="text-primary-600 text-sm font-semibold cursor-pointer hover:text-primary-700 hover:underline transition-colors"
         >
           ¿Olvidaste tu contraseña?
         </span>
       </p>
    </div>
  </div>
</div>

{/* Modal de Selección de Rol */}
      {showRoleModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setShowRoleModal(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-surface-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FontAwesomeIcon icon={faGoogle} className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Selecciona tu tipo de cuenta</h3>
                  <p className="text-white/80 text-sm">para continuar con Google</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-surface-600 text-sm text-center mb-4">
                ¿Cómo usarás la plataforma? Selecciona una opción para continuar:
              </p>

              {/* Opción: Usuario */}
              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedRole === 'usuario' 
                    ? 'border-primary-500 bg-primary-50 shadow-lg' 
                    : 'border-surface-200 hover:border-surface-300 hover:shadow-md'
                }`}
                onClick={() => handleRoleSelect('usuario')}
                disabled={isLoading}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedRole === 'usuario' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-surface-100 text-surface-600'
                  }`}>
                    <FontAwesomeIcon icon={faUser} className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-surface-800">Usuario</h4>
                    <p className="text-surface-500 text-sm">Busco alquilar un apartamento</p>
                  </div>
                </div>
              </div>

              {/* Opción: Arrendador */}
              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedRole === 'arrendador' 
                    ? 'border-primary-500 bg-primary-50 shadow-lg' 
                    : 'border-surface-200 hover:border-surface-300 hover:shadow-md'
                }`}
                onClick={() => handleRoleSelect('arrendador')}
                disabled={isLoading}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedRole === 'arrendador' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-surface-100 text-surface-600'
                  }`}>
                    <FontAwesomeIcon icon={faBuilding} className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-surface-800">Arrendador</h4>
                    <p className="text-surface-500 text-sm">Tengo propiedades para alquilar</p>
                  </div>
                </div>
              </div>

              <button 
                className="w-full py-3 bg-surface-100 text-surface-600 font-semibold rounded-xl hover:bg-surface-200 transition-colors"
                onClick={() => setShowRoleModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
