import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaTachometerAlt, FaCogs, FaCalendarAlt } from "react-icons/fa";
import { MdChat } from "react-icons/md";
import { useAuth } from "../Auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { CiMenuBurger } from "react-icons/ci";

const defaultMenuItems = [
  {
    title: "sidebar.dashboardMenu",
    icon: <FaTachometerAlt />,
    submenu: [
      { title: "sidebar.overview", component: "Dashboard", roles: ["ORGANIZER"] },
      { title: "sidebar.events", component: "Events", roles: ["ORGANIZER"] },
      { title: "sidebar.calendar", component: "Calendar", icon: <FaCalendarAlt />, roles: ["ORGANIZER", "EVENT ASSISTANT", "CHECK-IN STAFF", "TICKET MANAGER"] },
      { title: "sidebar.chat", component: "Chat", icon: <MdChat />, roles: ["ORGANIZER"] },
    ],
  },
  {
    title: "sidebar.teamAndRolesMenu",
    icon: <i className="fa-solid fa-chart-simple"></i>,
    submenu: [
      { title: "sidebar.assignRole", component: "AssignRole", roles: ["ORGANIZER"] },
      { title: "sidebar.assignedEvents", component: "AssignedEvents", roles: ["EVENT ASSISTANT", "CHECK-IN STAFF", "TICKET MANAGER"] },
    ],
  },
  {
    title: "sidebar.settingMenu",
    icon: <FaCogs />,
    submenu: [
      { title: "sidebar.profile", component: "Profile" },
    ],
  },
];

const Sidebar2 = ({ isOpen, toggleSidebar, setCurrentComponent, sidebarItems }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Merge defaultMenuItems with sidebarItems from props
  const menuItems = defaultMenuItems
    .map(menu => ({
      ...menu,
      title: t(menu.title),
      submenu: menu.submenu?.map(sub => {
        const sidebarItem = sidebarItems?.find(item => item.key === sub.component);
        return {
          ...sub,
          title: sidebarItem ? sidebarItem.label : t(sub.title),
        };
      }).filter(sub => !sub.roles || sub.roles.some(role => user?.primaryRoles?.includes(role))),
    }))
    .filter(menu => !menu.submenu || menu.submenu.length > 0);

  const [openMenus, setOpenMenus] = useState(
    menuItems.reduce((acc, menu) => {
      acc[menu.title] = true;
      return acc;
    }, {})
  );
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const toggleMenu = (menuTitle) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuTitle]: !prev[menuTitle],
    }));
  };

  const handleHomepage = () => {
    setCurrentComponent("Dashboard");
    toggleSidebar();
  };

  const handleBackHome = () => {
    navigate("/");
  };

  const handleSubmenuClick = (component) => {
    setCurrentComponent(component);
    setActiveSubmenu(component);
    if (isMobile && isOpen) toggleSidebar();
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white text-black border-r border-gray-200 overflow-y-auto transition-transform duration-300 z-40
        w-[240px] sm:w-64 lg:w-70 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="p-2 sm:p-3 lg:p-4">
        <div className="flex items-center justify-between mb-6 sm:mb-7 lg:mb-8 mt-2">
          <h1
            className="text-xl sm:text-2xl lg:text-[24px] font-bold text-orange-500 hover:cursor-pointer truncate"
            onClick={isMobile ? handleHomepage : handleBackHome}
          >
            {t('sidebar.header')}
          </h1>
          {isMobile && (
            <button onClick={handleHomepage} className="text-orange-500 hover:text-orange-600">
              <CiMenuBurger size={24} />
            </button>
          )}
        </div>
        <ul>
          {menuItems.map((menu) => (
            <SidebarItem
              key={menu.title}
              menu={menu}
              isOpen={openMenus[menu.title]}
              onClick={() => toggleMenu(menu.title)}
              activeSubmenu={activeSubmenu}
              handleSubmenuClick={handleSubmenuClick}
              toggleSidebar={toggleSidebar}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

const SidebarItem = ({ menu, isOpen, onClick, activeSubmenu, handleSubmenuClick, toggleSidebar }) => {
  return (
    <li className="mb-1 sm:mb-2">
      <div
        className={`flex justify-between items-center px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer transition-all duration-300 
          text-xs sm:text-sm lg:text-[15px] font-medium hover:bg-gray-100 hover:text-[#0357AF] ${isOpen ? "bg-[#E6FBFA] text-[#0357AF]" : ""}`}
        onClick={onClick}
      >
        <div className="flex items-center">
          {menu.icon && (
            <span className="mr-1 sm:mr-2 text-sm sm:text-base lg:text-[16px]">{menu.icon}</span>
          )}
          <span>{menu.title}</span>
        </div>
        {menu.submenu && (
          <FaChevronDown
            size={10}
            className={`ml-2 transition-transform sm:text-xs lg:text-sm ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </div>
      {menu.submenu && isOpen && (
        <ul className="mt-1 sm:mt-2 ml-2 sm:ml-3 lg:ml-4">
          {menu.submenu.map((sub) => (
            <li key={sub.title}>
              <button
                onClick={() => handleSubmenuClick(sub.component)}
                className={`block w-full text-left px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-3 rounded-lg transition-all text-xs sm:text-sm 
                  ${activeSubmenu === sub.component ? "text-[#0357AF] font-semibold" : "text-gray-700"} 
                  hover:bg-gray-100 hover:text-[#0357AF]`}
              >
                {sub.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Sidebar2;