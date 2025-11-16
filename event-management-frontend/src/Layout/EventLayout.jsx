import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../pages/Dashboard/Navbar';
import Sidebar from '../pages/Dashboard/Sidebar';
import ViewProfile from '../pages/Dashboard/ViewProfile';
import Session from '../pages/Session/session';
import Speaker from '../pages/Speaker/speaker';
import Sponsor from '../pages/Sponsor/sponsor';
import AddTicket from '../pages/Ticket/AddTicket';
import EditEvent from '../pages/Event/EditEventPage';
import TicketDashboard from '../pages/Ticket/TicketSold';
import MyTeamEvents from '../pages/Dashboard/MyTeamEvents';
import ProtectedRoute from '../components/ProtectedRoute';
import { ROLES } from '../constants/routes';

const EventLayout = () => {
  const location = useLocation();
  const eventId = location.state?.eventId;

  return (
    <div className="w-full md:w-[calc(100%-256px)] md:ml-64 min-h-screen transition-all">
      <Navbar />
      <Sidebar id={eventId} />
      <Routes>
        <Route
          path="view/:eventId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
              <ViewProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="session/:eventId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
              <Session />
            </ProtectedRoute>
          }
        />
        <Route
          path="speaker/:eventId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
              <Speaker />
            </ProtectedRoute>
          }
        />
        <Route
          path="sponsor/:eventId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
              <Sponsor />
            </ProtectedRoute>
          }
        />
        <Route
          path="addticket/:eventId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZER]}>
              <AddTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="editEvent/:eventId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZER]}>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="ticket/:eventId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
              <TicketDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-team/:eventId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
              <MyTeamEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="event/detail/:eventId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.TICKET_MANAGER, ROLES.EVENT_ASSISTANT, ROLES.CHECK_IN_STAFF]}>
              <EditEvent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default EventLayout;