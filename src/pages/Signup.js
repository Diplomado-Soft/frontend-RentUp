import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SucessModal from '../components/SuccessModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faEnvelope, faPhone, faLock, faUserTie, faHome, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/log.css';
import { signupUser } from '../apis/signupController';
import { UserContext } from "../contexts/UserContext";
import { firebaseGoogleSignIn } from "../apis/firebaseAuthService";

function Signup() {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mensaje, setMessage] = useState("");
    const [showSucess, setShowSucess] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);
    const [error, setError] = useState(false);
    const {login} = useContext(UserContext);
    const [userType, setUserType] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.role) {
            setUserType(location.state.role);
        }
    }, [location]);

    const goToHome = () => {
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!telefono || telefono.trim() === '') {
            setError(true);
            setMessage("El número de teléfono es obligatorio");
            return;
        }

        const cleanPhone = telefono.replace(/\D/g, '');
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

        const result = await signupUser({ nombre, apellido, email, telefono, password, rolId }, login);
        if (result.success) {
            setShowSucess(true);
        } else {
            setMessage(result.message);
            setError(true);
        }
    };

    const handleSuccessClose = () => {
        setShowSucess(false);
        navigate('/');
    }
    
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
                // Guardar usuario pendiente y mostrar modal de teléfono
                setPendingUser(result.user);
                login(result.user);
                
                // Verificar si el usuario ya tiene teléfono
                if (!result.user.telefono && !result.user.whatsapp) {
                    // Usuario nuevo sin teléfono - mostrar modal obligatorio
                    setShowPhoneModal(true);
                } else {
                    // Usuario existente con teléfono - ir directo
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
        const cleanPhone = telefono.replace(/\D/g, '');
        const cleanWhatsApp = whatsapp.replace(/\D/g, '');
        
        if (cleanPhone.length < 10) {
            setError(true);
            setMessage("El número de teléfono es obligatorio (mínimo 10 dígitos)");
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const token = userData?.token;
            
            // Actualizar teléfono y WhatsApp en el backend
            const response = await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/users/update-whatsapp`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        telefono: cleanPhone,
                        whatsapp: cleanWhatsApp || cleanPhone
                    })
                }
            );

            if (response.ok) {
                // Actualizar usuario en contexto con los nuevos datos
                if (pendingUser) {
                    const updatedUser = {
                        ...pendingUser,
                        telefono: cleanPhone,
                        whatsapp: cleanWhatsApp || cleanPhone
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
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

    return (
        <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr] grid-cols-1 items-center bg-gradient-to-br from-surface-800 via-surface-700 to-surface-900 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Exit Button */}
            <button 
                onClick={goToHome} 
                className="fixed top-6 left-6 w-12 h-12 rounded-full cursor-pointer text-white bg-white/10 backdrop-blur-md z-50 hover:bg-white/20 hover:rotate-90 hover:scale-110 transition-all duration-300 flex items-center justify-center border border-white/20 shadow-xl"
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
                </div>

                <div className="text-white max-w-xl space-y-8 animate-fade-in-up relative z-10">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6 border border-white/30">
                        <FontAwesomeIcon icon={faHome} className="text-4xl text-white" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Únete a nuestra comunidad
                    </h1>
                    <p className="text-white/80 text-xl leading-relaxed">
                        Encuentra o ofrece el alojamiento perfecto cerca de tu UniPutumayo
                    </p>

                    <div className="space-y-5 pt-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Busca propiedades verificadas</h3>
                                <p className="text-white/70 text-sm">100% confiables</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                <FontAwesomeIcon icon={faUser} className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Conecta con propietarios</h3>
                                <p className="text-white/70 text-sm">Comunicación directa</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                <FontAwesomeIcon icon={faHome} className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Gestiona tus propiedades</h3>
                                <p className="text-white/70 text-sm">Fácil y rápido</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section - Derecha */}
            <div className="bg-white h-screen flex flex-col justify-center px-8 lg:px-12 shadow-2xl relative overflow-y-auto">
                <div className="max-w-lg mx-auto w-full space-y-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <FontAwesomeIcon icon={faHome} className="text-white text-2xl" />
                        </div>
                        <h2 className="text-3xl font-bold text-surface-800 mb-2">Crea tu cuenta</h2>
                        <p className="text-surface-500 text-base">Únete a nuestra comunidad de estudiantes y propietarios</p>
                    </div>

                    {/* Role Selector */}
                    <div className="role-selector-header">
                        <h3 className="text-surface-700 text-sm font-semibold mb-3">Selecciona tu tipo de cuenta</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div 
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                userType === 'usuario' 
                                    ? 'border-primary-500 bg-primary-50 shadow-lg' 
                                    : 'border-surface-200 hover:border-surface-300 hover:shadow-md'
                            }`}
                            onClick={() => setUserType('usuario')}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                                userType === 'usuario' 
                                    ? 'bg-primary-500 text-white' 
                                    : 'bg-surface-100 text-surface-600'
                            }`}>
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                            <h3 className="font-semibold text-surface-800 mb-1">Usuario</h3>
                            <p className="text-surface-500 text-xs">Busco alojamiento</p>
                            {userType === 'usuario' && (
                                <div className="mt-3 flex items-center gap-1 text-primary-600 text-xs font-medium">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    <span>Seleccionado</span>
                                </div>
                            )}
                        </div>
                        
                        <div 
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                userType === 'arrendador' 
                                    ? 'border-primary-500 bg-primary-50 shadow-lg' 
                                    : 'border-surface-200 hover:border-surface-300 hover:shadow-md'
                            }`}
                            onClick={() => setUserType('arrendador')}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                                userType === 'arrendador' 
                                    ? 'bg-primary-500 text-white' 
                                    : 'bg-surface-100 text-surface-600'
                            }`}>
                                <FontAwesomeIcon icon={faUserTie} />
                            </div>
                            <h3 className="font-semibold text-surface-800 mb-1">Arrendador</h3>
                            <p className="text-surface-500 text-xs">Ofrezco alojamiento</p>
                            {userType === 'arrendador' && (
                                <div className="mt-3 flex items-center gap-1 text-primary-600 text-xs font-medium">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    <span>Seleccionado</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white hover:bg-surface-50 text-surface-700 font-semibold rounded-xl transition-all duration-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 border-2 border-surface-200 hover:border-primary-300"
                    >
                        <svg height="20" width="20" viewBox="0 0 24 24" fill="none">
                            <path fill="#1F2937" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#3B82F6" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#34A853" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#FBBC05" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continuar con Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center my-5">
                        <div className="flex-1 h-px bg-surface-200"></div>
                        <span className="px-4 text-surface-400 text-sm font-medium">o regístrate con email</span>
                        <div className="flex-1 h-px bg-surface-200"></div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-surface-700 text-xs font-semibold">Nombre</label>
                            <input 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                placeholder="Tu nombre"
                                className="input-field"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-surface-700 text-xs font-semibold">Apellido</label>
                            <input 
                                type="text" 
                                value={apellido} 
                                onChange={(e) => setApellido(e.target.value)} 
                                placeholder="Tu apellido"
                                className="input-field"
                            />
                        </div>
                        
                        <div className="col-span-2 flex flex-col gap-2">
                            <label className="text-surface-700 text-xs font-semibold">Correo electrónico</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="correo@ejemplo.com"
                                className="input-field"
                            />
                        </div>
                        
                        <div className="col-span-2 flex flex-col gap-2">
                            <label className="text-surface-700 text-xs font-semibold">Teléfono</label>
                            <input 
                                type="text" 
                                value={telefono} 
                                onChange={(e) => setTelefono(e.target.value)} 
                                placeholder="(+57) 300 123 4567"
                                className="input-field"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-surface-700 text-xs font-semibold">Contraseña</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="••••••••"
                                className="input-field"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-surface-700 text-xs font-semibold">Confirmar</label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                placeholder="••••••••"
                                className="input-field"
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 border-2 border-red-100 rounded-xl p-4 flex items-center gap-3 animate-shake">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-lg" />
                            <p className="text-red-600 font-medium text-sm">{mensaje}</p>
                        </div>
                    )}
                    
                    <button 
                        className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
                        onClick={handleSubmit}
                    >
                        <span>Registrarse ahora</span>
                        <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <p className="text-surface-500 text-center text-sm">
                        ¿Ya tienes cuenta?{" "}
                        <span 
                            onClick={() => navigate('/login')} 
                            className="text-primary-600 font-semibold cursor-pointer hover:text-primary-700 hover:underline"
                        >
                            Inicia sesión aquí
                        </span>
                    </p>
                </div>
            </div>

            {showSucess && <SucessModal message={'Registro Exitoso.'} goToLogin={handleSuccessClose} />}

            {/* Modal obligatorio para teléfono */}
            {showPhoneModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-surface-200">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <FontAwesomeIcon icon={faPhone} className="text-white text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg">Completa tu registro</h3>
                                    <p className="text-white/80 text-sm">Ingresa tu número de contacto</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FontAwesomeIcon icon={faPhone} className="text-primary-600 text-2xl" />
                                </div>
                                <p className="text-surface-600 text-sm">
                                    Para poder contactarte con arrendadores y recibir notificaciones, 
                                    necesitamos tu número de teléfono.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-surface-700 text-sm font-semibold">Teléfono *</label>
                                <input 
                                    type="text" 
                                    value={telefono} 
                                    onChange={(e) => setTelefono(e.target.value)} 
                                    placeholder="300 123 4567"
                                    className="input-field"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-surface-700 text-sm font-semibold">WhatsApp (opcional)</label>
                                <input 
                                    type="text" 
                                    value={whatsapp} 
                                    onChange={(e) => setWhatsapp(e.target.value)} 
                                    placeholder="300 123 4567"
                                    className="input-field"
                                />
                                <p className="text-surface-400 text-xs">Si es diferente al teléfono principal</p>
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                                    <p className="text-red-600 text-sm">{mensaje}</p>
                                </div>
                            )}

                            <button 
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                                onClick={handlePhoneSubmit}
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span>Continuar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Signup;
