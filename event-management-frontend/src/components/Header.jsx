import React, { useState, useRef, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaChevronDown } from "react-icons/fa";
import { useAuth } from "../pages/Auth/AuthProvider";
import { api } from "../pages/Auth/api";
import Swal from "sweetalert2";
import UpgradeOrganizerDialog from "./UpgradeOrganizerDialog";
import { AiFillAlipayCircle } from "react-icons/ai";
import { AiFillCodeSandboxCircle } from "react-icons/ai";
import { useTranslation } from 'react-i18next';

const LocationDropdown = ({ onLocationChange }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState("all-locations");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const locations = [
    { slug: "all-locations", name: t('header.allLocations') },
    { slug: "ho-chi-minh", name: t('header.hoChiMinh') },
    { slug: "ha-noi", name: t('header.haNoi') },
    { slug: "da-nang", name: t('header.daNang') },
    { slug: "hai-phong", name: t('header.haiPhong') },
    { slug: "can-tho", name: t('header.canTho') },
    { slug: "nha-trang", name: t('header.nhaTrang') },
    { slug: "da-lat", name: t('header.daLat') },
    { slug: "binh-duong", name: t('header.binhDuong') },
    { slug: "dong-nai", name: t('header.dongNai') },
    { slug: "quang-ninh", name: t('header.quangNinh') },
    { slug: "an-giang", name: t('header.anGiang') },
    { slug: "ba-ria-vung-tau", name: t('header.baRiaVungTau') },
    { slug: "bac-giang", name: t('header.bacGiang') },
    { slug: "bac-kan", name: t('header.bacKan') },
    { slug: "bac-lieu", name: t('header.bacLieu') },
    { slug: "bac-ninh", name: t('header.bacNinh') },
    { slug: "ben-tre", name: t('header.benTre') },
    { slug: "binh-dinh", name: t('header.binhDinh') },
    { slug: "binh-phuoc", name: t('header.binhPhuoc') },
    { slug: "binh-thuan", name: t('header.binhThuan') },
    { slug: "ca-mau", name: t('header.caMau') },
    { slug: "cao-bang", name: t('header.caoBang') },
    { slug: "dak-lak", name: t('header.dakLak') },
    { slug: "dak-nong", name: t('header.dakNong') },
    { slug: "dien-bien", name: t('header.dienBien') },
    { slug: "dong-thap", name: t('header.dongThap') },
    { slug: "gia-lai", name: t('header.giaLai') },
    { slug: "ha-giang", name: t('header.haGiang') },
    { slug: "ha-nam", name: t('header.haNam') },
    { slug: "ha-tinh", name: t('header.haTinh') },
    { slug: "hai-duong", name: t('header.haiDuong') },
    { slug: "hau-giang", name: t('header.hauGiang') },
    { slug: "hoa-binh", name: t('header.hoaBinh') },
    { slug: "hung-yen", name: t('header.hungYen') },
    { slug: "khanh-hoa", name: t('header.khanhHoa') },
    { slug: "kien-giang", name: t('header.kienGiang') },
    { slug: "kon-tum", name: t('header.konTum') },
    { slug: "lai-chau", name: t('header.laiChau') },
    { slug: "lam-dong", name: t('header.lamDong') },
    { slug: "lang-son", name: t('header.langSon') },
    { slug: "lao-cai", name: t('header.laoCai') },
    { slug: "long-an", name: t('header.longAn') },
    { slug: "nam-dinh", name: t('header.namDinh') },
    { slug: "nghe-an", name: t('header.ngheAn') },
    { slug: "ninh-binh", name: t('header.ninhBinh') },
    { slug: "ninh-thuan", name: t('header.ninhThuan') },
    { slug: "phu-tho", name: t('header.phuTho') },
    { slug: "phu-yen", name: t('header.phuYen') },
    { slug: "quang-binh", name: t('header.quangBinh') },
    { slug: "quang-nam", name: t('header.quangNam') },
    { slug: "quang-ngai", name: t('header.quangNgai') },
    { slug: "soc-trang", name: t('header.socTrang') },
    { slug: "son-la", name: t('header.sonLa') },
    { slug: "tay-ninh", name: t('header.tayNinh') },
    { slug: "thai-binh", name: t('header.thaiBinh') },
    { slug: "thai-nguyen", name: t('header.thaiNguyen') },
    { slug: "thanh-hoa", name: t('header.thanhHoa') },
    { slug: "thua-thien-hue", name: t('header.thuaThienHue') },
    { slug: "tien-giang", name: t('header.tienGiang') },
    { slug: "tra-vinh", name: t('header.traVinh') },
    { slug: "tuyen-quang", name: t('header.tuyenQuang') },
    { slug: "vinh-long", name: t('header.vinhLong') },
    { slug: "vinh-phuc", name: t('header.vinhPhuc') },
    { slug: "yen-bai", name: t('header.yenBai') },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCity = (citySlug) => {
    setSelected(citySlug);
    setIsOpen(false);
    onLocationChange(citySlug);
  };

  return (
    <div
      className="relative flex items-center px-2 sm:px-3 md:px-3 lg:px-4 w-[120px] lg:w-[200px]"
      ref={dropdownRef}
    >
      <FaMapMarkerAlt className="text-sm text-gray-500 cursor-pointer sm:text-base md:text-sm lg:text-base" />
      <div
        className="relative flex items-center ml-1 text-xs text-gray-500 cursor-pointer sm:ml-2 md:ml-1 lg:ml-2 sm:text-sm md:text-xs lg:text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="w-full px-2 py-1 truncate sm:px-3 md:px-2 lg:px-3 sm:py-2 md:py-1 lg:py-2">
          {locations.find((loc) => loc.slug === selected)?.name || selected}
        </span>
        <FaChevronDown className="ml-1 text-xs text-gray-400 sm:ml-2 md:ml-1 lg:ml-2 sm:text-sm md:text-xs lg:text-sm" />
      </div>
      {isOpen && (
        <div
          className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-md shadow-lg top-full left-4 sm:left-6 md:left-6 lg:left-8 w-36 sm:w-44 md:w-40 lg:w-48"
          style={{ maxHeight: '200px', overflowY: 'auto' }}
        >
          {locations.map((city) => (
            <div
              key={city.slug}
              className="p-2 text-xs text-gray-700 transition cursor-pointer sm:text-sm md:text-xs lg:text-sm hover:bg-orange-200"
              onClick={() => handleSelectCity(city.slug)}
            >
              {city.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all-locations");
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async () => {
    try {
      const apiUrl = `http://localhost:8080/api/events/search/by-name-and-city?term=${searchTerm}&city=${selectedLocation}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data)) {
        if (!searchHistory.includes(searchTerm)) {
          setSearchHistory((prev) => [searchTerm, ...prev.slice(0, 3)]);
        }
        navigate("/search", {
          state: { events: data, searchTerm: searchTerm },
        });
      } else {
        console.error("No valid data received from API");
        Swal.fire({
          icon: "error",
          title: t('header.error'),
          text: t('header.errorNoEvents'),
        });
      }
    } catch (error) {
      console.error("Error fetching events:", error.message);
      Swal.fire({
        icon: "error",
        title: t('header.error'),
        text: t('header.errorSearchFailed'),
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className="relative flex items-center bg-white rounded-full border p-1 sm:p-2 md:p-1 lg:p-2 w-full max-w-xs sm:max-w-md md:max-w-[360px] lg:max-w-2xl text-xs sm:text-[13px] md:text-[12px] lg:text-[13px] h-8 sm:h-10 md:h-9 lg:h-[40px]"
      ref={searchRef}
    >
      <div className="flex items-center px-2 sm:px-3 md:px-3 lg:px-4 w-[180px] sm:w-[220px] md:w-[200px] lg:w-[260px]">
        <i className="text-sm text-gray-500 fas fa-search sm:text-base md:text-sm lg:text-base"></i>
        <input
          type="text"
          placeholder={t('header.searchPlaceholder')}
          className="w-full ml-1 text-xs text-gray-500 outline-none sm:ml-2 md:ml-1 lg:ml-2 sm:text-sm md:text-xs lg:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onKeyPress={handleKeyPress}
        />
      </div>
      {showHistory && (
        <div className="absolute top-full left-6 sm:left-8 md:left-8 lg:left-10 w-[180px] sm:w-[220px] md:w-[200px] lg:w-[286px] bg-white border rounded shadow-lg z-50">
          {searchHistory.map((item, index) => (
            <div
              key={index}
              className="px-4 py-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-100 sm:text-sm md:text-xs lg:text-sm"
              onClick={() => {
                setSearchTerm(item);
                setShowHistory(false);
                handleSearch();
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
      <div className="h-4 mx-2 border-l border-gray-300 sm:h-6 md:h-5 lg:h-6 sm:mx-3 md:mx-3 lg:mx-4"></div>
      <div className="relative flex items-center px-2 sm:px-3 md:px-3 lg:px-4">
        <LocationDropdown onLocationChange={setSelectedLocation} />
      </div>
      <button
        className="ml-auto bg-red-600 text-white rounded-full px-2 sm:px-2 md:px-1 lg:px-2 py-0.5 sm:py-1 md:py-0.5 lg:py-1 hover:bg-red-700"
        onClick={handleSearch}
      >
        <i className="text-sm fas fa-search sm:text-base md:text-sm lg:text-base"></i>
      </button>
    </div>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("User:", user); // Debug user object
    const fetchUnreadCount = async () => {
      if (user && user.userId) {
        try {
          const response = await fetch(`http://localhost:8080/notify/unread-count/${user.userId}`, {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch unread count: ${response.status}`);
          }
          const count = await response.json();
          console.log("Unread count:", count); // Debug count
          setUnreadCount(count);
        } catch (error) {
          console.error("Error fetching unread notification count:", error.message);
        }
      }
    };

    fetchUnreadCount();
  }, [user]);

  const handleCreateEventClick = () => {
    navigate("/createEvent");
    setIsMobileMenuOpen(false);
  };
  const handleHomepage = () => {
    navigate("/");
    setIsMobileMenuOpen(false);
  };
  const handleLike = () => {
    navigate("/event-like");
    setIsMobileMenuOpen(false);
  };
  const handleMyInvoices = () => {
    navigate("/myinvoices");
    setIsMobileMenuOpen(false);
  };
  const handleViewAllTickets = () => {
    navigate("/view-all-tickets");
    setIsMobileMenuOpen(false);
  };
  const handleDashboard = () => {
    navigate("/dashboard");
    setIsMobileMenuOpen(false);
  };
  const handleViewProfile = () => {
    navigate("/view");
    setIsMobileMenuOpen(false);
  };
  const handleNoti = () => {
    navigate("/notifications");
    setIsMobileMenuOpen(false);
  };
  const handleAdmin = () => {
    navigate("/admin");
    setIsMobileMenuOpen(false);
  };
  const handleLogout = async () => {
    try {
      await api.logout();
      logout();
      navigate("/login");
      setIsMobileMenuOpen(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t('header.error'),
        text: t('header.errorLogoutFailed', { message: error.message || 'Server error' }),
      });
    }
  };

  const menuItems = [
    {
      icon: "bi-calendar4-event",
      text: t('header.createEvent'),
      action: handleCreateEventClick,
    },
    { icon: "bi-heart", text: t('header.likes'), action: handleLike },
    {
      icon: "bi bi-bell",
      text: t('header.noti'),
      action: handleNoti,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  const menuPopup = [
    {
      title: t('header.manageMyEvents'),
      action: handleDashboard,
      roles: ["ORGANIZER", "TICKET MANAGER", "EVENT ASSISTANT", "CHECK-IN STAFF"],
    },
    { title: t('header.invoices'), action: handleMyInvoices, roles: ["ORGANIZER", "ATTENDEE"] },
    { title: t('header.yourTickets'), action: handleViewAllTickets, roles: ["ORGANIZER", "ATTENDEE"] },
    { title: t('header.adminDashboard'), action: handleAdmin, roles: ["ADMIN"] },
    { title: t('header.profile'), action: handleViewProfile, roles: ["ATTENDEE"] },
    {
      title: t('header.upToOrganizer'),
      action: () => setOpenUpgradeDialog(true),
      roles: ["ATTENDEE"],
    },
    { title: t('header.logout'), action: handleLogout },
  ];

  const filteredMenuPopup = menuPopup.filter(
    (item) =>
      !item.roles ||
      item.roles.some((role) => user?.primaryRoles?.includes(role))
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-10 w-full bg-white shadow">
      <div className="flex flex-col items-center justify-between w-full h-auto px-4 py-2 sm:py-3 md:py-3 lg:py-4 sm:h-auto md:h-14 lg:h-16 sm:flex-col md:flex-row">
        <div className="flex items-center justify-between w-full sm:w-full md:w-auto">
          <div
            className="flex text-base font-bold text-red-500 transition duration-300 cursor-pointer sm:text-lg md:text-lg lg:text-2xl hover:text-red-700 font-josefin"
            onClick={handleHomepage}
          >
            <AiFillCodeSandboxCircle className="mx-2 text-[30px]" />
            Event
          </div>
          <button
            className="text-gray-500 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className="text-base fas fa-bars sm:text-lg md:text-lg"></i>
          </button>
        </div>
        <div className="w-full mt-2 sm:w-full md:w-auto sm:mt-2 md:mt-0">
          <SearchBar />
        </div>
        <div
          className="items-center hidden gap-2 mx-0 md:flex md:gap-3 lg:gap-6 md:mx-4"
          ref={menuRef}
        >
          {menuItems.map((item, index) => (
            <a
              key={index}
              className="flex flex-col items-center text-gray-500 text-[11px] md:text-[12px] lg:text-[13px] font-medium px-2 md:px-3 lg:px-[20px] cursor-pointer hover:text-blue-500 transition duration-300 relative"
              onClick={item.action}
            >
              <div className="relative">
                <i className={`${item.icon} text-sm md:text-base lg:text-lg`}></i>
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.text}
            </a>
          ))}
          <div
            className="relative flex items-center text-gray-500 text-[11px] md:text-[12px] lg:text-[13px] pl-2 md:pl-3 lg:pl-[20px] cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={() => setIsMenuOpen(true)}
          >
            {user ? (
              <>
                <i className="text-sm fa-solid fa-user md:text-base lg:text-lg"></i>
                <p className="pl-1 md:pl-1 lg:pl-[6px] font-medium hidden lg:block">
                  {user.email}
                </p>
                <i className="bi bi-chevron-down pt-1 md:pt-1 lg:pt-[4px] pl-1 md:pl-1 lg:pl-[3px] cursor-pointer text-xs md:text-sm lg:text-sm"></i>
                {isMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-44 md:w-48 lg:w-[205px] bg-white border rounded shadow-lg z-50"
                    onMouseLeave={() => setIsMenuOpen(false)}
                  >
                    {filteredMenuPopup.map((item, index) => (
                      <a
                        key={index}
                        className="block px-4 py-3 text-sm font-semibold text-gray-700 transition duration-200 hover:bg-red-50 hover:text-red-600"
                        onClick={item.action}
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-gray-500 hover:text-blue-500 px-2 md:px-2px lg:px-2 text-[11px] md:text-[12px] lg:text-[13px]"
                >
                  {t('header.login')}
                </a>
                <a
                  href="/signup"
                  className="text-gray-500 hover:text-blue-500 px-2 md:px-2 lg:px-2 text-[11px] md:text-[12px] lg:text-[13px]"
                >
                  {t('header.signup')}
                </a>
              </>
            )}
          </div>
        </div>
        {isMobileMenuOpen && (
          <div
            className="w-full py-2 mt-2 bg-white border-t md:hidden"
            ref={mobileMenuRef}
          >
            {menuItems.map((item, index) => (
            <a
              key={index}
              className="flex flex-col items-center text-gray-500 text-[11px] md:text-[12px] lg:text-[13px] font-medium px-2 md:px-3 lg:px-[20px] cursor-pointer hover:text-blue-500 transition duration-300 relative"
              onClick={item.action}
            >
              <div className="relative">
                <i className={`${item.icon} text-sm md:text-base lg:text-lg`}></i>
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.text}
            </a>
          ))}
            {user ? (
              filteredMenuPopup.map((item, index) => (
                <a
                  key={index}
                  className="block px-4 py-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-100 sm:text-sm"
                  onClick={item.action}
                >
                  {item.title}
                </a>
              ))
            ) : (
              <>
                <a
                  href="/login"
                  className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 sm:text-sm"
                >
                  {t('header.login')}
                </a>
                <a
                  href="/signup"
                  className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 sm:text-sm"
                >
                  {t('header.signup')}
                </a>
              </>
            )}
          </div>
        )}
        <UpgradeOrganizerDialog
          open={openUpgradeDialog}
          onClose={() => setOpenUpgradeDialog(false)}
        />
      </div>
    </div>
  );
};

export default Header;