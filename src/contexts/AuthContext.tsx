import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { isShopifyEmbedded, authenticateEmbedded, getEmbeddedToken, getEmbeddedUser } from '@/lib/shopify';

// localStorage pode estar indisponível em iframe embedded (cookies de terceiros
// bloqueados). Toda leitura/escrita passa por estes helpers tolerantes.
const safeGet = (key: string): string | null => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const safeRemove = (key: string) => {
  try { localStorage.removeItem(key); } catch { /* storage bloqueado */ }
};
const safeSet = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* storage bloqueado */ }
};

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  planName?: string;
  document?: string;
  address?: string;
  postalCode?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Sessão normal: token + usuário no localStorage.
    const token = safeGet('token');
    const userStr = safeGet('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsLoading(false);
        return;
      } catch (error) {
        safeRemove('token');
        safeRemove('user');
      }
    }

    // 2. Sessão embedded (Shopify admin): main.tsx autenticou via session token
    //    ANTES de renderizar; se o localStorage estiver bloqueado no iframe,
    //    a sessão vive em memória no módulo lib/shopify.
    const embeddedUser = getEmbeddedUser();
    if (embeddedUser && getEmbeddedToken()) {
      setUser(embeddedUser);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    let retriedEmbedded = false;

    const handleUnauthorized = () => {
      // Embedded: o JWT do CRM pode ter expirado dentro do admin da Shopify.
      // Tentar UMA re-autenticação silenciosa via session token antes de deslogar.
      if (isShopifyEmbedded() && !retriedEmbedded) {
        retriedEmbedded = true;
        authenticateEmbedded().then((ok) => {
          if (ok) {
            window.location.reload();
          } else {
            safeRemove('token');
            safeRemove('user');
            setUser(null);
          }
        });
        return;
      }

      safeRemove('token');
      safeRemove('user');
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback((token: string, userData: User) => {
    safeSet('token', token);
    safeSet('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    safeRemove('token');
    safeRemove('user');
    setUser(null);
  }, []);

  const isAuthenticated = !!user && !!(safeGet('token') || getEmbeddedToken());

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

