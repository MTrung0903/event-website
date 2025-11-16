import { Navigate } from 'react-router-dom';
import { useAuth } from '../pages/Auth/AuthProvider';
import { ROUTES } from '../constants/routes';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

export default ProtectedRoute;