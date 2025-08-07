import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            email: decoded.sub,
            userId: decoded.userId,
            roles: decoded.roles || [],
            permissions: decoded.permissions || [],
            primaryRoles: getPrimaryRoles(decoded.roles || []), // Thay primaryRole thành primaryRoles
          });
        } else {
          localStorage.removeItem('token');
          setUser(null);
          navigate('/login');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkToken();
    const interval = setInterval(checkToken, 300000);
    return () => clearInterval(interval);
  }, [navigate]);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setUser({
      email: decoded.sub,
      userId: decoded.userId,
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
      primaryRoles: getPrimaryRoles(decoded.roles || []),
    });
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const getPrimaryRoles = (roles) => {
    const roleMap = {
      'ROLE_ADMIN': 'ADMIN',
      'ROLE_ORGANIZER': 'ORGANIZER',
      'ROLE_ATTENDEE': 'ATTENDEE',
      'ROLE_TICKET MANAGER': 'TICKET MANAGER',
      'ROLE_EVENT ASSISTANT': 'EVENT ASSISTANT',
      'ROLE_CHECK-IN STAFF': 'CHECK-IN STAFF'
    };
    return roles
      .filter(role => roleMap[role]) 
      .map(role => roleMap[role]); 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);