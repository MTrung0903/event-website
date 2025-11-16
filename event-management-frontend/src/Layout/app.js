import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './pages/Auth/AuthProvider';
import { WebSocketProvider } from './pages/ChatBox/WebSocketContext';
import { useAuth } from './pages/Auth/AuthProvider';
import ChatBubble from './pages/ChatBox/ChatBubble';
import AuthLayout from './layouts/AuthLayout';
import FullScreenLayout from './layouts/FullScreenLayout';
import DashboardLayout from './layouts/DashboardLayout';
import EventDetailLayout from './layouts/EventDetailLayout';
import AdminLayout from './layouts/AdminLayout';
import { ROUTES, AUTH_ROUTES } from './constants/routes';
import './App.css';

// Component chính để xử lý các route và hiển thị layout
const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Xác định các trang không hiển thị ChatBubble
  const hideChatBubble = [
    ROUTES.CREATE_EVENT,
    ROUTES.CHAT,
  ].includes(location.pathname) || location.pathname.startsWith('/event/');

  return (
    <WebSocketProvider>
      <div className="w-full min-h-screen bg-white">
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<AuthLayout />}>
            <Route path="login" element={<AuthLayout />} />
            <Route path="signup" element={<AuthLayout />} />
            <Route path="forgot" element={<AuthLayout />} />
            <Route path="reset-password" element={<AuthLayout />} />
          </Route>

          {/* Fullscreen Routes */}
          <Route path="/" element={<FullScreenLayout />}>
            <Route index element={<FullScreenLayout />} />
            <Route path="event/:eventId" element={<FullScreenLayout />} />
            <Route path="search" element={<FullScreenLayout />} />
            <Route path="all-event" element={<FullScreenLayout />} />
            <Route path="list-event-search-by/:categoryName" element={<FullScreenLayout />} />
            <Route path="checkout" element={<FullScreenLayout />} />
            <Route path="event-like" element={<FullScreenLayout />} />
            <Route path="createEvent" element={<FullScreenLayout />} />
            <Route path="notifications" element={<FullScreenLayout />} />
            <Route path="myinvoices" element={<FullScreenLayout />} />
            <Route path="view-all-tickets" element={<FullScreenLayout />} />
            <Route path="view-tickets/:orderCode" element={<FullScreenLayout />} />
            <Route path="payment-result" element={<FullScreenLayout />} />
            <Route path="profile-organizer/:organizerName" element={<FullScreenLayout />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardLayout />} />
            <Route path="events" element={<DashboardLayout />} />
            <Route path="reports" element={<DashboardLayout />} />
            <Route path="chat" element={<DashboardLayout />} />
            <Route path="calendar" element={<DashboardLayout />} />
            <Route path="role" element={<DashboardLayout />} />
            <Route path="assigned-events" element={<DashboardLayout />} />
            <Route path="view" element={<DashboardLayout />} />
          </Route>

          {/* Event Detail Routes */}
          <Route path="/dashboard" element={<EventDetailLayout />}>
            <Route path="view/:eventId" element={<EventDetailLayout />} />
            <Route path="session/:eventId" element={<EventDetailLayout />} />
            <Route path="speaker/:eventId" element={<EventDetailLayout />} />
            <Route path="sponsor/:eventId" element={<EventDetailLayout />} />
            <Route path="addticket/:eventId" element={<EventDetailLayout />} />
            <Route path="editEvent/:eventId" element={<EventDetailLayout />} />
            <Route path="ticket/:eventId" element={<EventDetailLayout />} />
            <Route path="my-team/:eventId" element={<EventDetailLayout />} />
            <Route path="event/detail/:eventId" element={<EventDetailLayout />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminLayout />} />
            <Route path="user" element={<AdminLayout />} />
            <Route path="role" element={<AdminLayout />} />
          </Route>
        </Routes>

        {/* Hiển thị ChatBubble nếu cần */}
        {user && !AUTH_ROUTES.includes(location.pathname) && !hideChatBubble && (
          <ChatBubble currentUser={user} />
        )}
      </div>
    </WebSocketProvider>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer />
        <MainLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;