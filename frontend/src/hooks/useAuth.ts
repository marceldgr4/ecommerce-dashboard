import { useState, useCallback } from 'react';
import { authService } from '../services';
import type { AuthUser, LoginRequest } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      const authUser: AuthUser = {
        email: response.email,
        fullName: response.fullName,
        role: response.role,
      };
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        (err instanceof Error ? err.message : 'Invalid credentials');
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return { user, isLoading, error, login, logout };
};
