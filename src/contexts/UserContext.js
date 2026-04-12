import React, { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
    // Inicializar el estado a partir del localStorage, si existe
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (userData) => {
        // Soportar ambos formatos: destructurado o objeto completo
        const data = userData.token 
            ? userData 
            : { ...userData, token: userData.token };
        
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        
        // También guardar token en clave separada para fácil acceso
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            if (user.token) {
                localStorage.setItem('token', user.token);
            }
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
