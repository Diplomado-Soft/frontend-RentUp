import React, { useContext, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { updateUserData, fetchUserData } from "../../apis/myAccountController";
import Toast from '../Toast';

function User() {
    const { user, login } = useContext(UserContext);
    const { nombre, apellido, email, token } = user;
    const telefono = user?.telefono || user?.user_phonenumber || user?.phone || '';
    const [formData, setFormData] = useState({
        nombre: nombre || '',
        apellido: apellido || '',
        email: email || '',
        telefono: telefono || '',
        password: ''
    });
    const [toast, setToast] = useState(null);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    const createNewUserData = async (e) => {
        e.preventDefault();
        if (!token) {
            setToast({ message: "El usuario no ha iniciado sesión.", type: "error" });
            return;
        }
        const updatedData = await updateUserData(token, formData);
        if (updatedData) {
            const freshUserData = await fetchUserData(token);
            if (freshUserData) {
                login({
                    id: freshUserData.user_id,
                    nombre: freshUserData.user_name,
                    apellido: freshUserData.user_lastname,
                    email: freshUserData.user_email,
                    telefono: freshUserData.user_phonenumber,
                    rol: freshUserData.rol_id,
                    token: token
                })
                setFormData({
                    nombre: freshUserData.user_name,
                    apellido: freshUserData.user_lastname,
                    email: freshUserData.user_email,
                    telefono: freshUserData.user_phonenumber,
                    password: ''
                });
                setToast({ message: "Datos actualizados correctamente.", type: "success" });
            } else {
                setToast({ message: "Error al obtener los datos actualizados.", type: "error" });
            }
        } else {
            setToast({ message: "Error al actualizar los datos.", type: "error" });
        }
    }
    return (
        <div>
            <div className="flex items-center gap-4 mb-8 px-1">
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-brand-500">person</span>
                </div>
                <div>
                    <h2 className="font-display text-2xl text-ink">Información Personal</h2>
                    <p className="text-body-md text-ink-muted">Actualiza tus datos de contacto.</p>
                </div>
            </div>

            <form onSubmit={createNewUserData} className="space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="nombre" className="text-label-md text-on-surface-variant uppercase tracking-wider">Nombre</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
                        <input
                            type="text" id="nombre" name="nombre" required
                            value={formData.nombre} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="apellido" className="text-label-md text-on-surface-variant uppercase tracking-wider">Apellido</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
                        <input
                            type="text" id="apellido" name="apellido" required
                            value={formData.apellido} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-label-md text-on-surface-variant uppercase tracking-wider">Email</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">mail</span>
                        <input
                            type="email" id="email" name="email" required
                            value={formData.email} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="telefono" className="text-label-md text-on-surface-variant uppercase tracking-wider">Teléfono</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">phone</span>
                        <input
                            type="tel" id="telefono" name="telefono" required
                            value={formData.telefono} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password" className="text-label-md text-on-surface-variant uppercase tracking-wider">Contraseña</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                        <input
                            type="password" id="password" name="password"
                            value={formData.password} onChange={handleChange}
                            placeholder="Deja en blanco para mantener la actual"
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" className="px-6 py-3 bg-brand-500 text-white rounded-lg text-label-md font-medium hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span>
                        Guardar cambios
                    </button>
                </div>
            </form>
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={3000} />
            )}
        </div>
    );
}

export default User;
