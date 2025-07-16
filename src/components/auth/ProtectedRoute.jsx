import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CenteredSpinner from "../common/SpinnerLoading";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return <CenteredSpinner/>; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
