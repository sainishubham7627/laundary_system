import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAdmin as apiLogin, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);  // true while verifying stored token

  // On mount, restore session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('laundry_token');
      if (token) {
        try {
          const { admin: me } = await getMe();
          setAdmin(me);
        } catch {
          localStorage.removeItem('laundry_token');
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await apiLogin({ username, password });
    localStorage.setItem('laundry_token', data.token);
    setAdmin(data.admin);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('laundry_token');
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
