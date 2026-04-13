import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [role, setRole] = useState(() => {
        return localStorage.getItem('selectedRole') || null;
    });

    const login = (userData) => {
        const data = userData.token 
            ? userData 
            : { ...userData, token: userData.token };
        
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
    };

    const logout = () => {
        setUser(null);
        setRole(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('selectedRole');
    };
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            if (user.token) localStorage.setItem('token', user.token);
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }, [user]);
    useEffect(() => {
        if (role) {
            localStorage.setItem('selectedRole', role);
        } else {
            localStorage.removeItem('selectedRole');
        }
    }, [role]);

    return (
        <UserContext.Provider value={{ user, setUser, login, logout, role, setRole }}>
            {children}
        </UserContext.Provider>
    );
};