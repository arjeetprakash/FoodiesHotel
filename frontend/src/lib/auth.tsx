import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchMe, login as loginRequest, logoutSession, refreshSession, registerCustomer } from './api';
import type { AuthSession, AuthUser, Role } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (role: Role, email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  refreshAuth: () => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const storageKey = 'foodieshotel-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = (session: AuthSession) => {
    setToken(session.accessToken);
    setRefreshTokenValue(session.refreshToken);
    setUser(session.user);
    localStorage.setItem(storageKey, JSON.stringify(session));
  };

  const clearSession = () => {
    localStorage.removeItem(storageKey);
    setToken(null);
    setRefreshTokenValue(null);
    setUser(null);
  };

  useEffect(() => {
    const cached = localStorage.getItem(storageKey);
    if (!cached) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(cached) as AuthSession;
    persistSession(parsed);

    fetchMe(parsed.accessToken)
      .then((response) => {
        setUser(response.user);
      })
      .catch(async () => {
        try {
          const refreshed = await refreshSession(parsed.refreshToken);
          persistSession(refreshed);
        } catch {
          clearSession();
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (role: Role, email: string, password: string) => {
    const response = await loginRequest(role, email, password);
    persistSession(response);
  };

  const handleRegister = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const response = await registerCustomer(payload);
    persistSession(response);
  };

  const refreshAuth = async () => {
    if (!refreshTokenValue) {
      clearSession();
      return null;
    }

    try {
      const refreshed = await refreshSession(refreshTokenValue);
      persistSession(refreshed);
      return refreshed.accessToken;
    } catch {
      clearSession();
      return null;
    }
  };

  const handleLogout = () => {
    const activeRefreshToken = refreshTokenValue;
    clearSession();
    if (activeRefreshToken) {
      void logoutSession(activeRefreshToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken: refreshTokenValue,
        loading,
        login: handleLogin,
        register: handleRegister,
        refreshAuth,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
