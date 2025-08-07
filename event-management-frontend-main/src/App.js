import "./App.css";
import EventPage from "./pages/Event/FavoritesPage";
import EventDetail from "./pages/Event/EventDetailPage";
import HomePage from "./pages/Event/HomePage";
import SearchPage from "./pages/Event/SearchPage";
import CalendarPage from "./pages/Dashboard/Calendar";
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import TicketDashboard from "./pages/Ticket/TicketSold";
import ChatBox from "./pages/ChatBox/ChatBox";
import Dashboard from "./pages/Dashboard/Dashboard";
import Navbar from "./pages/Dashboard/Navbar";
import Sidebar from "./pages/Dashboard/Sidebar";
import LoginForm from "./pages/Auth/LogIn";
import NotificationList from "./pages/Dashboard/Notification";
import Checkout from "./pages/Checkout/checkout-page";
import Sponsor from "./pages/Sponsor/sponsor";
import Speaker from "./pages/Speaker/speaker";
import Session from "./pages/Session/session";
import AddTicket from "./pages/Ticket/AddTicket";
import ForgotPassword from "./pages/Auth/ForgotPass";
import CRUDEvent from "./pages/Event/CreateEventPage";


import ViewProfile from "./pages/Dashboard/ViewProfile";
import Sidebar2 from "./pages/Dashboard/MainSidebar";
import Header from "./components/Header";
import EditEvent from "./pages/Event/EditEventPage";
import AllEvent from "./pages/Event/PageViewAll";
import SearchByType from "./pages/Event/SearchPageByType";
import { AuthProvider } from "./pages/Auth/AuthProvider";
import DashboardPage from "./pages/AdminBoard/DashboardPage";
import OrganizerDashboard from "./pages/Dashboard/OrganizerReport";

import UserPage from "./pages/AdminBoard/UserPage";
import RolePermissionPage from "./pages/AdminBoard/RolePage";
import SidebarAdminBoard from "./pages/AdminBoard/Sidebar";
import { WebSocketProvider } from "./pages/ChatBox/WebSocketContext";
import { useAuth } from "./pages/Auth/AuthProvider";
import EventSignup from "./pages/Auth/SignUp";
import RoleBasedRouteGroup from "./pages/Auth/ProtectedRoute";
import ChatBubble from "./pages/ChatBox/ChatBubble";
import AdminRoleAssignment from "./pages/Dashboard/AssignRole";
import AssignedEvents from "./pages/Dashboard/AssignedEvents";

import MyTeamEvents from "./pages/Dashboard/MyTeamEvents";
import ProfileOrganizer from "./pages/Event/ProfileOrganizer";

import PaymentResult from "./pages/Checkout/PaymentResult";
import MyInvoice from "./pages/Booking/MyBooking";
import ViewAllTickets from "./pages/Ticket/ViewAllTickets"

import ViewTicket from "./pages/Ticket/ViewTicket";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "./pages/AdminBoard/AdminLayout";
import OrganizerLayout from "./pages/Dashboard/MainDashboard";
import ResetPassword from "./pages/Auth/ResetPassword";

const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const eventId = location.state?.eventId || undefined;
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isAuthPage = ["/login", "/signup", "/forgot", "/reset-password"].includes(
    location.pathname
  );

  const isFullScreenPageWithHeader =
    [
      "/",
      "/search",
      "/checkout",
      "/refund",
      "/event-like",
      "/createEvent",
      "/all-event",
      "/payment-result",
      "/myinvoices",
      "/view-all-tickets",
      "/notifications",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/event/") ||
    location.pathname.startsWith("/list-event-search-by") ||
    location.pathname.startsWith("/view-tickets") ||
    location.pathname.startsWith("/profile-organizer");

  const isDashboardPage = [
    "/dashboard",
    "/dashboard/events",
    "/dashboard/reports",
    "/chat",
    "/calendar",
    "/notifications",
    "/view",
    "/role",
    "/assigned-events",
  ].includes(location.pathname);

  const eventDetailBasePaths = [
    "/dashboard/view",
    "/dashboard/refund",
    "/dashboard/session",
    "/dashboard/speaker",
    "/dashboard/sponsor",
    "/dashboard/task",
    "/dashboard/addticket",
    "/dashboard/member",
    "/dashboard/editEvent",
    "/dashboard/ticket",
    "/dashboard/my-team",
    "/dashboard/event/detail",
    "/dashboard/order",
    "/dashboard/test",
  ];

  const isDetailOfEvent = eventDetailBasePaths.some((path) =>
    location.pathname.startsWith(path)
  );
  const isAdminPage = location.pathname.startsWith("/admin");
  const handleEventClick = (eventId) => {
    console.log(`Clicked event with ID: ${eventId}`);
  };
  const hideChatBubbleOnPages =
    ["/createEvent", "/chat"].includes(location.pathname) ||
    location.pathname.startsWith("/event/");
  return (
    <WebSocketProvider>
      <div className="w-full min-h-screen bg-white">
        {isAuthPage && (
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<EventSignup />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        )}

        {isFullScreenPageWithHeader && !isAuthPage && (
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
                <Route
                  path="/list-event-search-by/:categoryName"
                  element={<SearchByType />}
                />

                <Route
                  path="/checkout"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={["ATTENDEE", "ORGANIZER"]}
                    >
                      <Checkout />
                    </RoleBasedRouteGroup>
                  }
                />
               
                <Route
                  path="/event-like"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={["ATTENDEE", "ORGANIZER"]}
                    >
                      <EventPage />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/createEvent"
                  element={
                    <RoleBasedRouteGroup allowedRoles={["ORGANIZER"]}>
                      <CRUDEvent />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={["ORGANIZER", "ATTENDEE"]}
                    >
                      <NotificationList />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/myinvoices"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={["ORGANIZER", "ATTENDEE"]}
                    >
                      <MyInvoice />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/view-all-tickets"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={["ORGANIZER", "ATTENDEE"]}
                    >
                      <ViewAllTickets />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/view-tickets/:orderCode"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={["ORGANIZER", "ATTENDEE"]}
                    >
                      <ViewTicket />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/payment-result"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={["ORGANIZER", "ATTENDEE"]}
                    >
                      <PaymentResult />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/profile-organizer/:organizerName"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={["ORGANIZER", "ATTENDEE"]}
                    >
                      <ProfileOrganizer />
                    </RoleBasedRouteGroup>
                  }
                />
              </Routes>
            </div>
          </>
        )}

        {isDashboardPage &&
          !isAuthPage &&
          !isFullScreenPageWithHeader &&
          !isAdminPage && (
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <RoleBasedRouteGroup allowedRoles={["ORGANIZER", "TICKET MANAGER",
                    "EVENT ASSISTANT",
                    "CHECK-IN STAFF",]}>
                    <OrganizerLayout />
                  </RoleBasedRouteGroup>
                }
              />
              <Route
                path="/dashboard/events"
                element={
                  <RoleBasedRouteGroup
                    allowedRoles={[
                      "ORGANIZER",

                      "TICKET MANAGER",
                      "EVENT ASSISTANT",
                      "CHECK-IN STAFF",
                    ]}
                  >
                    <Dashboard />
                  </RoleBasedRouteGroup>
                }
              />
              <Route
                path="/dashboard/reports"
                element={
                  <RoleBasedRouteGroup allowedRoles={["ORGANIZER"]}>
                    <Dashboard />
                  </RoleBasedRouteGroup>
                }
              />
              <Route
                path="/chat"
                element={
                  <RoleBasedRouteGroup
                    allowedRoles={[
                      "ORGANIZER",
                      "TICKET MANAGER",
                      "EVENT ASSISTANT",
                      "CHECK-IN STAFF",
                    ]}
                  >
                    <ChatBox />
                  </RoleBasedRouteGroup>
                }
              />
              <Route
                path="/calendar"
                element={
                  <RoleBasedRouteGroup
                    allowedRoles={[
                      "ORGANIZER",
                      "TICKET MANAGER",
                      "EVENT ASSISTANT",
                      "CHECK-IN STAFF",
                    ]}
                  >
                    <CalendarPage />
                  </RoleBasedRouteGroup>
                }
              />
              <Route
                path="/role"
                element={
                  <RoleBasedRouteGroup allowedRoles={["ORGANIZER"]}>
                    <AdminRoleAssignment />
                  </RoleBasedRouteGroup>
                }
              />
              <Route
                path="/assigned-events"
                element={
                  <RoleBasedRouteGroup
                    allowedRoles={[
                      "ORGANIZER",
                      "TICKET MANAGER",
                      "EVENT ASSISTANT",
                      "CHECK-IN STAFF",
                    ]}
                  >
                    <AssignedEvents />
                  </RoleBasedRouteGroup>
                }
              />
              <Route
                path="/view"
                element={
                  <RoleBasedRouteGroup
                    allowedRoles={[
                      "ORGANIZER",
                      "TICKET MANAGER",
                      "EVENT ASSISTANT",
                      "CHECK-IN STAFF",
                      "ATTENDEE"
                    ]}
                  >
                    <ViewProfile />
                  </RoleBasedRouteGroup>
                }
              />
            </Routes>
          )}

        {isDetailOfEvent &&
          !isAuthPage &&
          !isFullScreenPageWithHeader &&
          !isAdminPage && (
            <div className="w-full md:w-[calc(100%-256px)] md:ml-64 min-h-screen transition-all">
              <Navbar />
              <Sidebar id={eventId} />
              <Routes>
                <Route
                  path="/dashboard/view/:eventId"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={[
                        "ORGANIZER",
                        "TICKET MANAGER",
                        "EVENT ASSISTANT",
                        "CHECK-IN STAFF",
                      ]}
                    >
                      <ViewProfile />
                    </RoleBasedRouteGroup>
                  }
                />
                {/* <Route
                  path="/dashboard/refund/:eventId"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={[
                        "ORGANIZER",
                        "TICKET MANAGER",
                        "EVENT ASSISTANT",
                        "CHECK-IN STAFF",
                      ]}
                    >
                      <RefundManagement />
                    </RoleBasedRouteGroup>
                  }
                /> */}
                <Route
                  path="/dashboard/session/:eventId"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={[
                        "ORGANIZER",
                        "TICKET MANAGER",
                        "EVENT ASSISTANT",
                        "CHECK-IN STAFF",
                      ]}
                    >
                      <Session />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/dashboard/speaker/:eventId"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={[
                        "ORGANIZER",
                        "TICKET MANAGER",
                        "EVENT ASSISTANT",
                        "CHECK-IN STAFF",
                      ]}
                    >
                      <Speaker />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/dashboard/sponsor/:eventId"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={[
                        "ORGANIZER",
                        "TICKET MANAGER",
                        "EVENT ASSISTANT",
                        "CHECK-IN STAFF",
                      ]}
                    >
                      <Sponsor />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/dashboard/speaker/:eventId"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={[
                        "ORGANIZER",
                        "TICKET MANAGER",
                        "EVENT ASSISTANT",
                        "CHECK-IN STAFF",
                      ]}
                    >
                      <Speaker />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/dashboard/addticket/:eventId"
                  element={
                    <RoleBasedRouteGroup allowedRoles={["ORGANIZER"]}>
                      <AddTicket />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/dashboard/editEvent/:eventId"
                  element={
                    <RoleBasedRouteGroup allowedRoles={["ORGANIZER"]}>
                      <EditEvent />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/dashboard/ticket/:eventId"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={[
                        "ORGANIZER",
                        "TICKET MANAGER",
                        "EVENT ASSISTANT",
                        "CHECK-IN STAFF",
                      ]}
                    >
                      <TicketDashboard />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/dashboard/my-team/:eventId"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={[
                        "ORGANIZER",
                        "TICKET MANAGER",
                        "EVENT ASSISTANT",
                        "CHECK-IN STAFF",
                      ]}
                    >
                      <MyTeamEvents />
                    </RoleBasedRouteGroup>
                  }
                />
                <Route
                  path="/dashboard/event/detail/:eventId"
                  element={
                    <RoleBasedRouteGroup
                      allowedRoles={[
                        "ORGANIZER",
                        "TICKET MANAGER",
                        "EVENT ASSISTANT",
                        "CHECK-IN STAFF",
                      ]}
                    >
                      <EditEvent />
                    </RoleBasedRouteGroup>
                  }
                />
              </Routes>
            </div>
          )}

        {isAdminPage && !isAuthPage && (
          <Routes>
            <Route
              path="/admin"
              element={
                <RoleBasedRouteGroup allowedRoles={["ADMIN"]}>
                  <AdminLayout />
                </RoleBasedRouteGroup>
              }
            />
            <Route
              path="/admin/user"
              element={
                <RoleBasedRouteGroup allowedRoles={["ADMIN"]}>
                  <UserPage />
                </RoleBasedRouteGroup>
              }
            />
            <Route
              path="/admin/role"
              element={
                <RoleBasedRouteGroup allowedRoles={["ADMIN"]}>
                  <RolePermissionPage />
                </RoleBasedRouteGroup>
              }
            />
          </Routes>
        )}

        {user &&
          !isAuthPage &&
          !isDashboardPage &&
          !isAdminPage &&
          !isDetailOfEvent &&
          !hideChatBubbleOnPages && <ChatBubble currentUser={user} />}
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
