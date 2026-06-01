import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'padhai_token';
const USER_KEY  = 'padhai_user';

// ── API helper ────────────────────────────────────────────────────────────────
const api = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
};

// ── useAuth hook ──────────────────────────────────────────────────────────────
export const useAuth = () => {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // On mount — verify stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || user) return;
    api('/api/profile')
      .then(({ user: u }) => { setUser(u); localStorage.setItem(USER_KEY, JSON.stringify(u)); })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); });
  }, []);

  const persist = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  };

  const register = useCallback(async ({ name, email, password, semester, branch }) => {
    setLoading(true); setError('');
    try {
      const data = await api('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, semester, branch }),
      });
      persist(data.token, data.user);
      return data;
    } catch (e) {
      setError(e.message); throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true); setError('');
    try {
      const data = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      persist(data.token, data.user);
      return data;
    } catch (e) {
      setError(e.message); throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setError('');
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return { user, loading, error, register, login, logout, clearError, isLoggedIn: !!user };
};

export default useAuth;
