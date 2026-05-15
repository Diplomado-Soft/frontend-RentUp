import React, { useContext, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { updateUserData, fetchUserData } from "../../apis/myAccountController";

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
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    const createNewUserData = async (e) => {
        e.preventDefault();
        if (!token) {
            alert("El usuario no ha iniciado sesión.");
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
                alert("Datos actualizados correctamente.");
            } else {
                alert("Error al obtener los datos actualizados.");
            }
        } else {
            alert("Error al actualizar los datos.");
        }
    }
    const initials = (nombre?.charAt(0) || '') + (apellido?.charAt(0) || '');
    return (
        <div>
            <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <span className="text-primary font-headline text-headline-md">{initials || 'U'}</span>
                </div>
                <div>
                    <h2 className="font-headline text-headline-md text-on-surface">Información Personal</h2>
                    <p className="text-body-md text-on-surface-variant">Actualiza tu foto y detalles de contacto.</p>
                </div>
            </div>

            <form onSubmit={createNewUserData} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label htmlFor="nombre" className="text-label-md text-on-surface-variant uppercase tracking-wider">Nombre</label>
                    <input
                        type="text" id="nombre" name="nombre" required
                        value={formData.nombre} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="apellido" className="text-label-md text-on-surface-variant uppercase tracking-wider">Apellido</label>
                    <input
                        type="text" id="apellido" name="apellido" required
                        value={formData.apellido} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="email" className="text-label-md text-on-surface-variant uppercase tracking-wider">Email</label>
                    <input
                        type="email" id="email" name="email" required
                        value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="telefono" className="text-label-md text-on-surface-variant uppercase tracking-wider">Teléfono</label>
                    <input
                        type="phone" id="telefono" name="telefono" required
                        value={formData.telefono} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                    />
                </div>
                <div className="space-y-1 md:col-span-2">
                    <label htmlFor="password" className="text-label-md text-on-surface-variant uppercase tracking-wider">Contraseña</label>
                    <input
                        type="password" id="password" name="password"
                        value={formData.password} onChange={handleChange}
                        placeholder="Deja en blanco para mantener la actual"
                        className="w-full px-4 py-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline text-body-md"
                    />
                </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                    <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span>
                        Guardar cambios
                    </button>
                </div>
            </form>
        </div>
    );
}

export default User;
