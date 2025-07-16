import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ROLE } from '../constant/key';
import { Navigate } from 'react-router-dom';
import StaffMainLayout from './StaffMainLayout';
import ManagerMainLayout from './ManagerMainLayout'; 
import CenteredSpinner from './common/SpinnerLoading';

const AuthLayoutSelector = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <CenteredSpinner />; 
  }

  if (!user || !user.role) {
    return <Navigate to="/unauthorized" replace />;
  }

  switch (user.role) {
    case ROLE.STAFF_WAREHOUSE:
      return <StaffMainLayout />;
    case ROLE.MANAGER_WAREHOUSE:
      return <ManagerMainLayout />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default AuthLayoutSelector;