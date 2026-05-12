import React, {useContext, useState} from "react";
import { UserContext } from "../../contexts/UserContext";
import {updateUserData, fetchUserData} from "../../apis/myAccountController";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faLock, faBuilding, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

function User() {
    const { user, login } = useContext(UserContext);
    const { nombre, apellido, email, telefono, rol, token } = user;
    const defaultRol = rol === 'Arrendador' ? 'Arrendador' : 'Usuario';
    const [formData, setFormData] = useState({
        nombre: nombre || '',
        apellido: apellido || '',
        email: email || '',
        telefono: telefono || '',
        rol: rol || defaultRol,
        password: ''
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    const createNewUserData = async (e) => {
        e.preventDefault();
        if (!token) {
            alert("El usuario no ha iniciado sesión.");
            return;
        }
        console.log(formData);
        const updatedData = await updateUserData( token, formData);
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
                    rol: freshUserData.rol_id,
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
    return(
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-surface-800">Mis datos</h3>
                    <p className="text-sm text-surface-500">Actualiza tu información personal</p>
                </div>
            </div>

            <form onSubmit={createNewUserData} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="flex flex-col">
                    <label htmlFor="nombre" className="text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-surface-500" />
                        Nombre
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-surface-700"
                    />
                </div>

                {/* Apellido */}
                <div className="flex flex-col">
                    <label htmlFor="apellido" className="text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-surface-500" />
                        Apellido
                    </label>
                    <input
                        type="text"
                        id="apellido"
                        name="apellido"
                        required
                        value={formData.apellido}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-surface-700"
                    />
                </div>

                {/* Email */}
                <div className="flex flex-col md:col-span-2">
                    <label htmlFor="email" className="text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faEnvelope} className="text-surface-500" />
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-surface-700"
                    />
                </div>

                {/* Teléfono */}
                <div className="flex flex-col">
                    <label htmlFor="telefono" className="text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faPhone} className="text-surface-500" />
                        Teléfono
                    </label>
                    <input
                        type="phone"
                        id="telefono"
                        name="telefono"
                        required
                        value={formData.telefono}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-surface-700"
                    />
                </div>

                {/* Contraseña */}
                <div className="flex flex-col">
                    <label htmlFor="password" className="text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faLock} className="text-surface-500" />
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Deja en blanco para mantener la actual"
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-surface-700"
                    />
                </div>

                {/* Botón */}
                <div className="md:col-span-2 flex justify-end mt-4">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faSave} />
                        Guardar cambios
                    </button>
                </div>
            </form>
        </div>
    );
}

export default User;
