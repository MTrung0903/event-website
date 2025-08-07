import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "./MainSidebar";
import Navbar from "../Dashboard/Navbar";
import Dashboard from "./Dashboard";
import Calendar from "./Calendar";
import ChatBox from "../ChatBox/ChatBox";
import AssignedEvents from "./AssignedEvents";
import AdminRoleAssignment from "./AssignRole";
import ViewProfile from "./ViewProfile";
import OrganizerDashboard from "./OrganizerReport";
import Loader from "../../components/Loading";
import { useLocation } from "react-router-dom";
const OrganizerLayout = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentComponent, setCurrentComponent] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Kiểm tra state từ navigation và cập nhật currentComponent
    if (location.state?.component) {
      setCurrentComponent(location.state.component);
    }
    setTimeout(() => {
      setLoading(false);
    }, 100);
    window.scrollTo(0, 0);
  }, [location.state]); // Thêm location.state vào dependency array

  const sidebarItems = [
    { key: "Dashboard", label: t('sidebar.organizerDashboard') },
    { key: "Events", label: t('sidebar.events') },
    { key: "Calendar", label: t('sidebar.calendar') },
    { key: "Chat", label: t('sidebar.chat') },
    { key: "AssignRole", label: t('sidebar.assignRole') },
    { key: "AssignedEvents", label: t('sidebar.assignedEvents') },
    { key: "Profile", label: t('sidebar.profile') },
  ];

  const renderComponent = () => {
    switch (currentComponent) {
      case "Dashboard":
        return <OrganizerDashboard />;
      case "Events":
        return <Dashboard />;
      case "Calendar":
        return <Calendar />;
      case "Chat":
        return <ChatBox />;
      case "AssignRole":
        return <AdminRoleAssignment />;
      case "AssignedEvents":
        return <AssignedEvents />;
      case "Profile":
        return <ViewProfile />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div>
        <Loader alt={t('sidebar.loadingAlt')} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        setCurrentComponent={setCurrentComponent}
        sidebarItems={sidebarItems}
      />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">{renderComponent()}</main>
      </div>
    </div>
  );
};

export default OrganizerLayout;