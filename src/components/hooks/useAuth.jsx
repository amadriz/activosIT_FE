import { useMemo } from 'react';

export const useAuth = () => {
  const userData = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('userData') || '{}');
    } catch (error) {
      console.error('Error parsing userData from sessionStorage:', error);
      return {};
    }
  }, []);

  const token = sessionStorage.getItem('token');
  
  // Considerar logueado si hay token Y userData con información básica
  const isLoggedIn = !!(token && (userData?.email || userData?.authToken));
  const userRole = userData?.rol;
  const userName = userData?.nombre || userData?.name;
  const userEmail = userData?.email;

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    if (!userRole) return false;
    return userRole === role;
  };

  // Función para verificar si el usuario tiene alguno de los roles permitidos
  const hasAnyRole = (allowedRoles) => {
    if (!userRole || !Array.isArray(allowedRoles)) return false;
    return allowedRoles.includes(userRole);
  };

  // Función para verificar si es administrador
  const isAdmin = () => {
    return hasAnyRole(['admin']);
  };

  // Función para verificar si es estudiante
  const isStudent = () => {
    return hasAnyRole(['estudiante']);
  };

  // Función para verificar si es profesor
  const isTeacher = () => {
    return hasAnyRole(['profesor']);
  };

  // Función para verificar si es técnico
  const isTechnician = () => {
    return hasAnyRole(['tecnico']);
  };

  // Función para cerrar sesión
  const logout = () => {
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('rol'); // Por si había datos del formato anterior
    window.location.href = '/login';
  };

  return {
    // Datos del usuario
    userData,
    isLoggedIn,
    userRole,
    userName,
    userEmail,
    
    // Funciones de verificación de roles
    hasRole,
    hasAnyRole,
    isAdmin,
    isStudent,
    isTeacher,
    isTechnician,
    
    // Funciones de autenticación
    logout
  };
};