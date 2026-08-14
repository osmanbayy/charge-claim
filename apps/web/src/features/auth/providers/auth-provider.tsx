"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AuthUser, LoginInput } from "../types/auth";
import { getAccessToken, removeAccessToken, setAccessToken } from "@/lib/auth/access-token";
import { getCurrentUser } from "../api/auth";
import { login as loginRequest } from "../api/auth"
import { toast } from 'sonner';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode,
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession(): Promise<void> {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        removeAccessToken();
        setUser(null);
        toast.error('Oturum sona erdi', {
          description: 'Güvenliğiniz için yeniden giriş yapmanız gerekiyor.',
          id: 'session-expired',
        });
      } finally {
        setIsLoading(false);
      }

    }
    
    void restoreSession();
  }, []);

  async function login(loginInput: LoginInput): Promise<void> {
    const response = await loginRequest(loginInput);

    setAccessToken(response.accessToken);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      removeAccessToken();
      throw error;
    }
  }

  function logout(): void {
    removeAccessToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth must be used inside AuthProvder.');

  return context;
}
