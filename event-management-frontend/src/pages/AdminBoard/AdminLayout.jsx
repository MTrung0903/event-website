
import React, { useState, useEffect } from "react";
import SidebarAdminBoard from "./Sidebar";
import DashboardPage from "./DashboardPage";
import UserPage from './UserPage';
import UserEditPopup from './UserEditPopup';
import RolePermissionPage from './RolePage';
import Navbar from '../Dashboard/Navbar';
import EventTypeManagement from "./EventTypeManagement";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentComponent, setCurrentComponent] = useState("Dashboard");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case "Dashboard":
        return <DashboardPage />;
      case "User":
        return <UserPage />;
      case "Role":
        return <RolePermissionPage />;
      case "Types":
        return <EventTypeManagement/>
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="relative min-h-screen flex">
      <SidebarAdminBoard
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        setCurrentComponent={setCurrentComponent}
      />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">{renderComponent()}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
