import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SucessModal from '../components/SuccessModal';
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
                setPendingUser(result.user);
                login(result.user);
                
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
            
            const response = await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/users/update-whatsapp`,
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

    const handleRoleChange = (role) => {
        setUserType(role);
        if (role === "usuario") {
            setMessage("");
            setError(false);
        } else if (role === "arrendador") {
            setMessage("");
            setError(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background font-body text-on-background">
            {/* Exit Button */}
            <button 
                onClick={goToHome} 
                className="fixed top-6 left-6 w-12 h-12 rounded-full cursor-pointer text-white bg-white/10 backdrop-blur-md z-50 hover:bg-white/20 hover:rotate-90 hover:scale-110 transition-all duration-300 flex items-center justify-center border border-white/20 shadow-xl"
                aria-label="Volver al inicio"
            >
                <span className="material-symbols-outlined text-xl font-bold">close</span>
            </button>

            {/* Left Side - Purple Brand Section */}
            <section className="relative w-full md:w-5/12 bg-gradient-to-br from-primary via-primary-container to-primary-700 p-12 flex flex-col justify-between overflow-hidden min-h-[400px] md:min-h-screen">
                <div className="absolute inset-0 z-0 opacity-30">
                    <img 
                        alt="Concepto visual de vivienda estudiantil"
                        className="w-full h-full object-cover mix-blend-overlay"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjgpT-d03BeREqhXcb2A2rPo2vuekIFarFQslGnUoojP1_z2jXmzRwCl3p4EseK4mzsj61eaQwrBKbVVHYun7CCfwrT5pDipDkcCgc6c7U9vA__KPIe4VvQ0CdDH9iX1d2WeEzzXKmdz63-Zc9smnd-qy20Fm3Ftj5ctAH41JPinwVCXCuz9izDq2p9UklbbMnUPStslH_M6V3k-A9pFoW0D6u18xQUESkvLRfADb7lpipn3cnAQXmjOQUpnPEOk8omoSMVVCiQpU-"
                    />
                </div>
                <div className="z-10">
                    <h1 className="font-headline text-headline-md text-on-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">home</span>
                        RentUp
                    </h1>
                </div>
                <div className="z-10 space-y-6 mb-10">
                    <h2 className="font-headline text-headline-lg text-on-primary leading-tight max-w-sm">
                        Bienvenido a RentUp
                    </h2>
                    <p className="text-body-md text-primary-fixed/90 max-w-xs">
                        Encuentra el hogar perfecto para tu etapa universitaria. Un espacio diseñado para tu éxito académico.
                    </p>
                </div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
                <div className="absolute top-1/4 -right-12 w-48 h-48 bg-white/20 rounded-full blur-2xl z-0 pointer-events-none"></div>
            </section>

            {/* Right Side - Form Container */}
            <section className="w-full md:w-7/12 bg-surface-container-lowest flex items-center justify-center p-6 md:p-16 lg:p-24 overflow-y-auto">
                <div className="w-full max-w-lg space-y-8">
                    {/* Tab Selector */}
                    <div className="flex items-center border-b border-outline-variant pb-4">
                        <button className="relative pb-4 text-primary font-bold border-b-2 border-primary font-headline text-headline-sm transition-all duration-200">
                            Registrarse
                        </button>
                        <button 
                            onClick={() => navigate('/login')}
                            className="relative pb-4 text-outline font-body text-body-md hover:text-on-surface-variant transition-all duration-200 ml-8"
                        >
                            Iniciar Sesión
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Role Selection Chips */}
                        <div className="space-y-2">
                            <label className="font-label text-label-md text-on-surface-variant uppercase tracking-wider">¿Cómo te unes a nosotros?</label>
                            <div className="flex gap-2">
                                <label className="cursor-pointer group flex-1">
                                    <input 
                                        checked={userType === 'usuario'} 
                                        className="hidden peer" 
                                        name="role" 
                                        type="radio" 
                                        value="usuario"
                                        onChange={() => handleRoleChange('usuario')}
                                    />
                                    <div className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl border border-outline-variant peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container transition-all group-hover:bg-surface-container-high">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        <span className="font-label text-label-md">Usuario</span>
                                    </div>
                                </label>
                                <label className="cursor-pointer group flex-1">
                                    <input 
                                        checked={userType === 'arrendador'} 
                                        className="hidden peer" 
                                        name="role" 
                                        type="radio" 
                                        value="arrendador"
                                        onChange={() => handleRoleChange('arrendador')}
                                    />
                                    <div className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl border border-outline-variant peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container transition-all group-hover:bg-surface-container-high">
                                        <span className="material-symbols-outlined text-sm">badge</span>
                                        <span className="font-label text-label-md">Arrendador</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Name Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="font-label text-label-md text-on-surface-variant" htmlFor="nombre">Nombre</label>
                                <input 
                                    id="nombre"
                                    type="text" 
                                    value={nombre} 
                                    onChange={(e) => setNombre(e.target.value)} 
                                    placeholder="Ej. Juan"
                                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-shadow placeholder:text-outline/50 text-body-md text-on-surface"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-label text-label-md text-on-surface-variant" htmlFor="apellido">Apellido</label>
                                <input 
                                    id="apellido"
                                    type="text" 
                                    value={apellido} 
                                    onChange={(e) => setApellido(e.target.value)} 
                                    placeholder="Ej. Pérez"
                                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-shadow placeholder:text-outline/50 text-body-md text-on-surface"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="font-label text-label-md text-on-surface-variant" htmlFor="email">Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">mail</span>
                                <input 
                                    id="email"
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="nombre@universidad.edu"
                                    className="w-full pl-11 bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-shadow placeholder:text-outline/50 text-body-md text-on-surface"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="font-label text-label-md text-on-surface-variant" htmlFor="telefono">Teléfono</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">phone</span>
                                <input 
                                    id="telefono"
                                    type="tel" 
                                    value={telefono} 
                                    onChange={(e) => setTelefono(e.target.value)} 
                                    placeholder="+57 300 123 4567"
                                    className="w-full pl-11 bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-shadow placeholder:text-outline/50 text-body-md text-on-surface"
                                />
                            </div>
                        </div>

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="font-label text-label-md text-on-surface-variant" htmlFor="password">Contraseña</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                                    <input 
                                        id="password"
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        placeholder="••••••••"
                                        className="w-full pl-11 bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-shadow placeholder:text-outline/50 text-body-md text-on-surface"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-label text-label-md text-on-surface-variant" htmlFor="confirm-password">Confirmar Contraseña</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                                    <input 
                                        id="confirm-password"
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        placeholder="••••••••"
                                        className="w-full pl-11 bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-shadow placeholder:text-outline/50 text-body-md text-on-surface"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-error-container/50 rounded-lg p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-error text-lg">warning</span>
                                <p className="text-error font-medium text-sm">{mensaje}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-2 space-y-4">
                            <button 
                                type="submit"
                                className="w-full bg-primary-gradient text-on-primary font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all duration-150 ease-in-out"
                            >
                                Crear Cuenta
                            </button>

                            <div className="flex items-center gap-4 py-2">
                                <div className="h-px bg-outline-variant flex-1"></div>
                                <span className="font-label text-label-md text-outline">o regístrate con</span>
                                <div className="h-px bg-outline-variant flex-1"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full flex items-center justify-center gap-3 bg-surface-container border border-outline-variant text-on-surface font-body text-body-md py-4 px-6 rounded-xl hover:bg-surface-container-high transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continuar con Google
                            </button>
                        </div>

                        <p className="text-center text-label-md text-outline px-4 pt-2">
                            Al registrarte, aceptas nuestros{" "}
                            <span className="text-primary font-bold hover:underline cursor-pointer">Términos de Servicio</span>{" "}
                            y <span className="text-primary font-bold hover:underline cursor-pointer">Política de Privacidad</span>.
                        </p>
                    </form>
                </div>
            </section>

            {showSucess && <SucessModal message={'Registro Exitoso.'} goToLogin={handleSuccessClose} />}

            {/* Phone Modal */}
            {showPhoneModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-surface-container-high">
                        <div className="bg-primary-gradient px-6 py-5">
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
                                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-primary text-2xl">phone</span>
                                </div>
                                <p className="text-on-surface-variant text-sm">
                                    Para poder contactarte con arrendadores y recibir notificaciones, 
                                    necesitamos tu número de teléfono.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-on-surface text-sm font-semibold">Teléfono *</label>
                                <input 
                                    type="text" 
                                    value={telefono} 
                                    onChange={(e) => setTelefono(e.target.value)} 
                                    placeholder="300 123 4567"
                                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-shadow placeholder:text-outline/50 text-body-md text-on-surface"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-on-surface text-sm font-semibold">WhatsApp (opcional)</label>
                                <input 
                                    type="text" 
                                    value={whatsapp} 
                                    onChange={(e) => setWhatsapp(e.target.value)} 
                                    placeholder="300 123 4567"
                                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary transition-shadow placeholder:text-outline/50 text-body-md text-on-surface"
                                />
                                <p className="text-on-surface-variant text-xs">Si es diferente al teléfono principal</p>
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">warning</span>
                                    <p className="text-red-600 text-sm">{mensaje}</p>
                                </div>
                            )}

                            <button 
                                className="w-full py-3 bg-primary-gradient hover:bg-primary-gradient-hover text-white font-bold rounded-xl shadow-lg hover:shadow-primary-glow transition-all duration-300 flex items-center justify-center gap-2"
                                onClick={handlePhoneSubmit}
                            >
                                <span className="material-symbols-outlined">check_circle</span>
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
