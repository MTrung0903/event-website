import React, { useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { MdTypeSpecimen } from "react-icons/md";
const SidebarAdminBoard = ({ isSidebarOpen, toggleSidebar, setCurrentComponent }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dashboardItems = [
    { name: "Dashboard", icon: "fas fa-shopping-cart", component: "Dashboard" },
  ];

  const conceptItems = [
    { name: "User", icon: "fas fa-user", component: "User", hasDropdown: true },

    { name: "Event types", icon: "fas fa-box", component: "Types", hasDropdown: true },
  ];

  const handleItemClick = (component) => {
    setCurrentComponent(component);
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <aside
      className={`bg-white w-64 flex flex-col border-r border-gray-200 fixed top-0 left-0 h-screen transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 transition-transform z-50 overflow-y-auto`}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
        <button 
          onClick={handleBackHome}
          className="flex items-center gap-2"
        >
          <div className="bg-[#1e293b] text-white rounded-full p-2">
            <i className="fas fa-cube fa-lg"></i>
          </div>
          <span className="font-extrabold text-lg select-none">Management Event</span>
        </button>
        <button 
          onClick={toggleSidebar}
          className="block"
        >
          <CiMenuBurger className="text-2xl" />
        </button>
      </div>
      <nav className="flex-1 px-6 py-4 text-sm text-gray-600">
        <p className="uppercase font-semibold text-xs mb-3 select-none">DASHBOARD</p>
        <ul className="space-y-3">
          {dashboardItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleItemClick(item.component)}
                className={`flex items-center gap-2 w-full text-left ${
                  item.component === "Dashboard"
                    ? "text-[#3b82f6] font-semibold"
                    : "hover:text-[#3b82f6]"
                }`}
              >
                <i className={item.icon}></i>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="uppercase font-semibold text-xs mt-8 mb-3 select-none">MANAGEMENT</p>
        <ul className="space-y-3">
          {conceptItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleItemClick(item.component)}
                className={`flex items-center gap-2 w-full text-left ${
                  item.component === "User" || item.component === "Role"|| item.component === "Types"
                    ? "text-[#3b82f6] font-semibold"
                    : "hover:text-[#3b82f6]"
                }`}
              >
                <i className={item.icon}></i>
                {item.name}
                {/* {item.hasDropdown && (
                  <i className="fas fa-chevron-down ml-auto"></i>
                )} */}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarAdminBoard;