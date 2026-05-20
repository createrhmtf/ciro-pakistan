import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isMock } from '../services/firebase';
import { authService, syncUserProfile } from '../services/authService';
import AuthContext from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isMock) {
      const mockUser = authService.getMockUser();
      setUser(mockUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const providerId = firebaseUser.providerData?.[0]?.providerId || 'password';
          const profile = await syncUserProfile(firebaseUser, providerId);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Auth state sync error:', e);
        setError(e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Wrap each auth action to also update local React state
  const loginWithGoogle = useCallback(async () => {
    const result = await authService.loginWithGoogle();
    if (result) setUser(result);
    return result;
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    const result = await authService.loginWithMicrosoft();
    if (result) setUser(result);
    return result;
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    const result = await authService.loginWithEmail(email, password);
    if (result) setUser(result);
    return result;
  }, []);

  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    const result = await authService.signUpWithEmail(email, password, displayName);
    if (result) setUser(result);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    await authService.resetPassword(email);
  }, []);

  const value = {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithEmail,
    signUpWithEmail,
    logout,
    resetPassword,
  };

  if (loading) return <LoadingScreen />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
