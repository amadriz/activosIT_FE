import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [userData, setUserData] = useState({});
  const [token, setToken] = useState(null);

  // Function to read auth data from sessionStorage
  const readAuthData = () => {
    try {
      const storedUserData = JSON.parse(sessionStorage.getItem('userData') || '{}');
      const storedToken = sessionStorage.getItem('token');
      setUserData(storedUserData);
      setToken(storedToken);
    } catch (error) {
      console.error('Error parsing userData from sessionStorage:', error);
      setUserData({});
      setToken(null);
    }
  };

  // Read initial auth data and listen for storage changes
  useEffect(() => {
    readAuthData();

    // Listen for storage changes (when sessionStorage is updated)
    const handleStorageChange = (e) => {
      if (e.key === 'userData' || e.key === 'token') {
        readAuthData();
      }
    };

    // Listen for custom event when login updates sessionStorage
    const handleAuthUpdate = () => {
      readAuthData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authUpdate', handleAuthUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authUpdate', handleAuthUpdate);
    };
  }, []);
  
  // Considerar logueado si hay token Y userData con información básica
  const isLoggedIn = !!(token && (userData?.email || userData?.authToken));
  const userRole = userData?.rol;
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
    
    // Trigger auth update event
    window.dispatchEvent(new CustomEvent('authUpdate'));
    
    // Use relative path that works with both local and production
    window.location.href = window.location.origin + window.location.pathname + '#/login';
  };

  return {
    // Datos del usuario
    userData,
    isLoggedIn,
    userRole,
    userEmail,
    nombre: userData?.nombre,
    apellido: userData?.apellido,
    
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