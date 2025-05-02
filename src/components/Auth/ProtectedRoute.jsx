import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStorage } from '../../utilities/storage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getStorage('currentUser');
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return children;
};

export default ProtectedRoute;