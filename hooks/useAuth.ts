//@ts-ignore
import { useState, useEffect, useCallback } from 'react';
import { getSession, isAuthenticated as checkAuth } from '../auth/session';
import { LichessSession } from '../types';

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [session, setSession] = useState<LichessSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches authentication state
   */
  const checkAuthentication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const sessionData = await getSession();
        setSession(sessionData);
      } else {
        setSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsAuthenticated(false);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  /**
   * Redirects to Lichess login page
   */
  const login = useCallback(() => {
    window.location.href = '/api/auth/lichess/login';
  }, []);

  /**
   * Logs out the current user
   */
  const logout = useCallback(() => {
    window.location.href = '/api/auth/lichess/logout';
  }, []);

  return {
    isAuthenticated,
    session,
    loading,
    error,
    login,
    logout,
    refresh: checkAuthentication
  };
}