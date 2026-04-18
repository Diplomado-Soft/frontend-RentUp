// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './UserContext';

/**
 * ProtectedRoute Component
 * @param {React.ReactNode} children - Contenido a renderizar si está autenticado
 * @param {number|number[]} requiredRole - Rol(es) requerido(s) para acceder (1=usuario, 2=arrendador, 3=admin)
 * @param {string} fallbackPath - Ruta a redirigir si no cumple con los permisos (default: "/login")
 */
const ProtectedRoute = ({ children, requiredRole = null, fallbackPath = '/login' }) => {
    const { user } = useContext(UserContext);

    // Si no hay usuario, redirige a login
    if (!user) {
        console.log('ProtectedRoute: No hay usuario, redirigiendo a login');
        return <Navigate to="/login" replace />;
    }

    // Si se especifica un rol requerido, verificar que el usuario lo tenga
    if (requiredRole !== null) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        // Buscar el rol en múltiples posiciones por compatibilidad
        const userRole = user.rol || user.rol_id || user.rolId;
        
        console.log('ProtectedRoute: Verificando acceso');
        console.log('  Usuario:', user.email);
        console.log('  Rol del usuario:', userRole);
        console.log('  Roles permitidos:', allowedRoles);
        
        if (!allowedRoles.includes(userRole)) {
            console.warn(`Acceso denegado. Usuario tiene rol ${userRole}, se requiere ${allowedRoles}`);
            return <Navigate to={fallbackPath} replace />;
        }
        
        console.log('✅ Acceso permitido');
    }

    // Si hay usuario y cumple con los permisos, renderiza los hijos
    return children;
};

export default ProtectedRoute;
