import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    // Redirect unauthenticated users to splash or home
    return <Navigate to="/splash" replace />;
  }

  return <>{children}</>;
}
