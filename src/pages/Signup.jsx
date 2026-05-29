import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SucessModal from '../components/SuccessModal';
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
    const [idDocument, setIdDocument] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.title = 'Registrarse | RentUp';
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

        const result = await signupUser({ nombre, apellido, email, telefono, password, rolId, id_document: idDocument }, login);
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
                const userWithToken = { ...result.user, token: result.token };
                setPendingUser(userWithToken);
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
                    const token = pendingUser.token;
                    const updatedUser = {
                        ...pendingUser,
                        telefono: cleanPhone,
                        whatsapp: cleanWhatsApp || cleanPhone
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    login({ ...updatedUser, token });
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
        <div className="min-h-screen flex flex-col md:flex-row w-full bg-surface">
            {/* Volver al inicio */}
            <button 
                onClick={goToHome} 
                className="fixed top-6 right-6 w-10 h-10 rounded-full cursor-pointer text-white bg-brand-navy/70 backdrop-blur-md z-50 hover:bg-brand-navy hover:scale-110 transition-all duration-300 flex items-center justify-center border border-white/20 shadow-xl"
                aria-label="Volver al inicio"
            >
                <span className="material-symbols-outlined text-xl font-bold">arrow_back</span>
            </button>

            {/* Left Side - Brand Section */}
            <section className="hidden md:flex relative w-1/2 flex-col justify-center items-center p-8 overflow-hidden bg-brand-navy">
                <div className="absolute inset-0 z-0 opacity-40">
                    <img 
                        alt="Ilustración de RentUp"
                        className="w-full h-full object-cover mix-blend-overlay"
                        src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    />
                </div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl opacity-30" />
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl opacity-20" />
                <div className="relative z-10 max-w-md text-center text-white">
                    <h1 className="font-headline text-headline-lg mb-4 leading-tight">Bienvenido a RentUp</h1>
                    <p className="text-body-md text-white/80 px-8">Encuentra el hogar perfecto para tu etapa universitaria. Conectamos estudiantes con las mejores opciones de vivienda.</p>
                </div>
            </section>

            {/* Right Side - Clean Form */}
            <section className="flex-1 flex flex-col justify-center items-center p-4 bg-surface-container-lowest min-h-screen overflow-y-auto" style={{scrollbarGutter: 'stable'}}>
                <div className="w-full max-w-md">
                    {/* Mobile branding */}
                    <div className="md:hidden mb-6 text-center">
                        <span className="font-headline text-headline-md text-brand-navy font-bold">RentUp</span>
                    </div>

                    <div className="bg-surface-container-lowest p-6">
                        {/* Tab Selector — fixed order: Iniciar Sesión | Registrarse */}
                        <div className="flex border-b border-surface-variant mb-8">
                            <button 
                                onClick={() => navigate('/login')}
                                className="flex-1 pb-4 text-center border-b-2 border-transparent text-on-surface-variant hover:text-brand-navy transition-colors text-label-md uppercase tracking-wider"
                            >
                                Iniciar Sesión
                            </button>
                            <button className="flex-1 pb-4 text-center border-b-2 border-brand-navy text-brand-navy font-bold text-label-md uppercase tracking-wider">
                                Registrarse
                            </button>
                        </div>

                        <h2 className="font-headline text-headline-md mb-6 text-on-surface">Crear cuenta</h2>

                        <form className="space-y-2" onSubmit={handleSubmit}>
                        {/* Role Selection Chips */}
                        <div className="space-y-1">
                            <label className="font-label text-label-xs text-on-surface-variant uppercase tracking-wider">¿Cómo te unes a nosotros?</label>
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
                                    <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg border border-outline-variant peer-checked:bg-brand-navy peer-checked:text-white peer-checked:border-brand-navy transition-all group-hover:bg-surface-container-high">
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
                                    <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg border border-outline-variant peer-checked:bg-brand-navy peer-checked:text-white peer-checked:border-brand-navy transition-all group-hover:bg-surface-container-high">
                                        <span className="material-symbols-outlined text-sm">badge</span>
                                        <span className="font-label text-label-md">Arrendador</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {userType === 'arrendador' && (
                          <div className="space-y-1">
                            <label className="font-label text-label-xs text-on-surface-variant uppercase tracking-wider">Foto de la cédula *</label>
                            <div className="relative">
                              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">badge</span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => setIdDocument(e.target.files[0] || null)}
                                className="w-full pl-9 bg-surface-container-low rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 transition-all text-body-md text-on-surface file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-brand-navy/10 file:text-brand-navy file:text-xs file:font-semibold hover:file:bg-brand-navy/20"
                              />
                            </div>
                          </div>
                        )}

                        {/* Name Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="font-label text-label-xs text-on-surface-variant uppercase tracking-wider" htmlFor="nombre">Nombre</label>
                                <input 
                                    id="nombre"
                                    type="text" 
                                    value={nombre} 
                                    onChange={(e) => setNombre(e.target.value)} 
                                    placeholder="Ej. Juan"
                                    className="w-full bg-surface-container-low rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 transition-all text-body-md text-on-surface placeholder:text-outline/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-label text-label-xs text-on-surface-variant uppercase tracking-wider" htmlFor="apellido">Apellido</label>
                                <input 
                                    id="apellido"
                                    type="text" 
                                    value={apellido} 
                                    onChange={(e) => setApellido(e.target.value)} 
                                    placeholder="Ej. Pérez"
                                    className="w-full bg-surface-container-low rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 transition-all text-body-md text-on-surface placeholder:text-outline/50"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="font-label text-label-xs text-on-surface-variant uppercase tracking-wider" htmlFor="email">Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">mail</span>
                                <input 
                                    id="email"
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="nombre@universidad.edu"
                                    className="w-full pl-9 bg-surface-container-low rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 transition-all text-body-md text-on-surface placeholder:text-outline/50"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <label className="font-label text-label-xs text-on-surface-variant uppercase tracking-wider" htmlFor="telefono">Teléfono</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">phone</span>
                                <input 
                                    id="telefono"
                                    type="tel" 
                                    value={telefono} 
                                    onChange={(e) => setTelefono(e.target.value)} 
                                    placeholder="+57 300 123 4567"
                                    className="w-full pl-9 bg-surface-container-low rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 transition-all text-body-md text-on-surface placeholder:text-outline/50"
                                />
                            </div>
                        </div>

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="font-label text-label-xs text-on-surface-variant uppercase tracking-wider" htmlFor="password">Contraseña</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                                    <input 
                                        id="password"
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        placeholder="••••••••"
                                        className="w-full pl-9 bg-surface-container-low rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 transition-all text-body-md text-on-surface placeholder:text-outline/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="font-label text-label-xs text-on-surface-variant uppercase tracking-wider" htmlFor="confirm-password">Confirmar Contraseña</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                                    <input 
                                        id="confirm-password"
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        placeholder="••••••••"
                                        className="w-full pl-9 bg-surface-container-low rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 transition-all text-body-md text-on-surface placeholder:text-outline/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-error-container/50 rounded-lg p-2.5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-error text-lg">warning</span>
                                <p className="text-error font-medium text-sm">{mensaje}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-1 space-y-2">
                            <button 
                                type="submit"
                                className="w-full bg-brand-navy text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-brand-navy/90 active:scale-[0.98] transition-all text-label-md uppercase tracking-wider"
                            >
                                Crear Cuenta
                            </button>

                            <div className="flex items-center gap-3 py-1">
                                <div className="h-px bg-outline-variant flex-1"></div>
                                <span className="font-label text-label-md text-outline">o regístrate con</span>
                                <div className="h-px bg-outline-variant flex-1"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full flex items-center justify-center gap-3 bg-surface-container border border-outline-variant text-on-surface font-body text-body-md py-2.5 px-6 rounded-lg hover:bg-surface-container-high transition-colors"
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

                        <p className="text-center text-label-md text-outline pt-1">
                            Al registrarte, aceptas nuestros{" "}
                            <span className="text-brand-navy font-bold hover:underline cursor-pointer">Términos de Servicio</span>{" "}
                            y <span className="text-brand-navy font-bold hover:underline cursor-pointer">Política de Privacidad</span>.
                        </p>
                    </form>
                </div>
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
                        <div className="bg-brand-navy px-6 py-5">
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
                                <div className="w-16 h-16 bg-brand-navy/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-brand-navy text-2xl">phone</span>
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
                                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-brand-navy transition-shadow placeholder:text-outline/50 text-body-md text-on-surface"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-on-surface text-sm font-semibold">WhatsApp (opcional)</label>
                                <input 
                                    type="text" 
                                    value={whatsapp} 
                                    onChange={(e) => setWhatsapp(e.target.value)} 
                                    placeholder="300 123 4567"
                                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-brand-navy transition-shadow placeholder:text-outline/50 text-body-md text-on-surface"
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
                                className="w-full py-3 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
