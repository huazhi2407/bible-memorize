import React, { createContext, useContext, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const TOKEN_KEY = 'bible-memorize-token';
const USER_KEY = 'bible-memorize-user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem(TOKEN_KEY, tokenValue);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const fetchWithAuth = useCallback((url, opts = {}) => {
    const headers = new Headers(opts.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    // 只在 body 是字符串且沒有 Content-Type 時設置 JSON Content-Type
    // FormData 會自動設置 multipart/form-data，不應該覆蓋
    if (!headers.has('Content-Type') && opts.body && typeof opts.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }
    // 如果是 FormData，不要設置 Content-Type（讓瀏覽器自動設置）
    if (opts.body instanceof FormData) {
      headers.delete('Content-Type');
    }
    return fetch(API_BASE + url, { ...opts, headers }).then((res) => {
      if (res.status === 401) {
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return res;
    });
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchWithAuth, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
