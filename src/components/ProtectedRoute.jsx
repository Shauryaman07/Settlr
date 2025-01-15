import { useAuth } from '@clerk/clerk-react';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isLoaded, userId } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 