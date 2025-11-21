import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as googleApiService from '../services/googleApiService';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const storedUser = await googleApiService.restoreSession();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const signIn = useCallback(async () => {
    try {
      const signedInUser = await googleApiService.signIn();
      setUser(signedInUser);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error; // Re-throw to be handled by UI
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await googleApiService.signOut();
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, []);

  return {
    user,
    isLoading,
    signIn,
    signOut,
  };
};
