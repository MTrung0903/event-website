import { Routes, Route } from 'react-router-dom';
import AdminLayoutComponent from '../pages/AdminBoard/AdminLayout';
import UserPage from '../pages/AdminBoard/UserPage';
import RolePermissionPage from '../pages/AdminBoard/RolePage';
import ProtectedRoute from '../components/ProtectedRoute';
import { ROLES } from '../constants/routes';

const AdminLayout = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <AdminLayoutComponent />
        </ProtectedRoute>
      }
    />
    <Route
      path="user"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <UserPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="role"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <RolePermissionPage />
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default AdminLayout;