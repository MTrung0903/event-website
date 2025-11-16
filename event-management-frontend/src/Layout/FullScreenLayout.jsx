import { Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import HomePage from '../pages/Event/HomePage';
import EventDetail from '../pages/Event/EventDetailPage';
import SearchPage from '../pages/Event/SearchPage';
import AllEvent from '../pages/Event/PageViewAll';
import SearchByType from '../pages/Event/SearchPageByType';
import Checkout from '../pages/Checkout/checkout-page';
import EventPage from '../pages/Event/FavoritesPage';
import CRUDEvent from '../pages/Event/CreateEventPage';
import NotificationList from '../pages/Dashboard/Notification';
import MyInvoice from '../pages/Booking/MyBooking';
import ViewAllTickets from '../pages/Ticket/ViewAllTickets';
import ViewTicket from '../pages/Ticket/ViewTicket';
import PaymentResult from '../pages/Checkout/PaymentResult';
import ProfileOrganizer from '../pages/Event/ProfileOrganizer';
import ProtectedRoute from '../components/ProtectedRoute';
import { ROUTES, ROLES } from '../constants/routes';

const FullScreenLayout = () => {
  const handleEventClick = (eventId) => {
    console.log(`Clicked event with ID: ${eventId}`);
  };

  return (
    <>
      <Header />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/event/:eventId" element={<EventDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/all-event"
            element={<AllEvent onEventClick={handleEventClick} />}
          />
          <Route path="/list-event-search-by/:categoryName" element={<SearchByType />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ATTENDEE, ROLES.ORGANIZER]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event-like"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ATTENDEE, ROLES.ORGANIZER]}>
                <EventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/createEvent"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ORGANIZER]}>
                <CRUDEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.ATTENDEE]}>
                <NotificationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/myinvoices"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.ATTENDEE]}>
                <MyInvoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-all-tickets"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.ATTENDEE]}>
                <ViewAllTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-tickets/:orderCode"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.ATTENDEE]}>
                <ViewTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-result"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.ATTENDEE]}>
                <PaymentResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-organizer/:organizerName"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ORGANIZER, ROLES.ATTENDEE]}>
                <ProfileOrganizer />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};

export default FullScreenLayout;