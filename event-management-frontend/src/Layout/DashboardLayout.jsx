import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import OrganizerLayout from '../pages/Dashboard/MainDashboard';
import ChatBox from '../pages/ChatBox/ChatBox';
import CalendarPage from '../pages/Dashboard/Calendar';

import AdminRoleAssignment from '../pages/Dashboard/AssignRole';
import AssignedEvents from '../pages/Dashboard/AssignedEvents';
import ViewProfile from '../pages/Dashboard/ViewProfile';
import ProtectedRoute from '../components/ProtectedRoute';
import { ROUTES, ROLES } from '../constants/routes';

const DashboardLayout = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
          <OrganizerLayout />
        </ProtectedRoute>
      }
    />
    <Route
      path="events"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="reports"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ORGANIZER]}>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="chat"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
          <ChatBox />
        </ProtectedRoute>
      }
    />
    <Route
      path="calendar"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
          <CalendarPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="role"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ORGANIZER]}>
          <AdminRoleAssignment />
        </ProtectedRoute>
      }
    />
    <Route
      path="assigned-events"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
          <AssignedEvents />
        </ProtectedRoute>
      }
    />
    <Route
      path="view"
      element={
        <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF, ROLES.ATTENDEE]}>
          <ViewProfile />
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default DashboardLayout;