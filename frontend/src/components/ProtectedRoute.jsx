import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './common/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  // If user is not authenticated, redirect to login with return path
  if (!user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;