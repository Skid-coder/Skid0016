import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = process.env.REACT_APP_API_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crm_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then(data => { setUser(data); setLoading(false); })
        .catch(() => { logout(); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [token]);

  function login(tokenValue, userData) {
    localStorage.setItem('crm_token', tokenValue);
    setToken(tokenValue);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('crm_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
