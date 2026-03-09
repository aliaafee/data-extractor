import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, getSetupStatus } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const mePromise = token
      ? getMe().then(setUser).catch(() => localStorage.removeItem('token'))
      : Promise.resolve();

    const setupPromise = getSetupStatus()
      .then(({ setupRequired }) => setSetupRequired(setupRequired))
      .catch(() => {});

    Promise.all([mePromise, setupPromise]).finally(() => setLoading(false));
  }, []);

  function saveAuth(token, userData) {
    localStorage.setItem('token', token);
    setUser(userData);
    setSetupRequired(false);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, setupRequired, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
