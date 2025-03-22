//@ts-ignore
import { useState, useEffect, useCallback } from 'react';
import { fetchUserProfile, fetchUserPreferences, fetchUserGames } from '../api/account';
import { LichessUser } from '../types';
import { useAuth } from './useAuth';

/**
 * Hook for accessing and managing user data
 */
export function useUser() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [user, setUser] = useState<LichessUser | null>(null);
  const [preferences, setPreferences] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch user profile data
   */
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userData = await fetchUserProfile({ noCache: true });
      setUser(userData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Fetch user preferences
   */
  const fetchPrefs = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const prefsData = await fetchUserPreferences();
      setPreferences(prefsData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchProfile();
    }
  }, [authLoading, isAuthenticated, fetchProfile]);

  return {
    user,
    preferences,
    loading: loading || authLoading,
    error,
    refresh: fetchProfile,
    fetchPreferences: fetchPrefs
  };
}

/**
 * Hook for fetching a user's games
 * 
 * @param username - Optional username (defaults to current user)
 * @param options - Game fetch options
 */
export function useUserGames(
  username?: string, 
  options = { max: 10, ongoing: true, finished: true }
) {
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGames = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const gamesData = await fetchUserGames(username, options);
      setGames(gamesData || []);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, username, options]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames();
    }
  }, [isAuthenticated, fetchGames]);

  return {
    games,
    loading,
    error,
    refresh: fetchGames
  };
}