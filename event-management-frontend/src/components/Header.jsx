import React, { useState, useRef, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FaMapMarkerAlt, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AiFillCodeSandboxCircle } from "react-icons/ai";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../pages/Auth/AuthProvider";
import { api } from "../pages/Auth/api";
import Swal from "sweetalert2";
import UpgradeOrganizerDialog from "./UpgradeOrganizerDialog";
import "./Header.css";

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
    <div className="location-dropdown" ref={dropdownRef}>
      <FaMapMarkerAlt className="location-icon" />
      <div className="location-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="location-text">
          {locations.find((loc) => loc.slug === selected)?.name || selected}
        </span>
        <FaChevronDown className="dropdown-arrow" />
      </div>
      {isOpen && (
        <div className="location-menu">
          {locations.map((city) => (
            <div
              key={city.slug}
              className="location-item"
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

const SearchBar = ({ onSearch }) => {
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
      const response = await fetch(
        `http://localhost:8080/api/events/search/by-name-and-city?term=${searchTerm}&city=${selectedLocation}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        if (searchTerm && !searchHistory.includes(searchTerm)) {
          setSearchHistory((prev) => [searchTerm, ...prev.slice(0, 3)]);
        }
        navigate("/search", { state: { events: data, searchTerm } });
      } else {
        Swal.fire({
          icon: "error",
          title: t('header.error'),
          text: t('header.errorNoEvents'),
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t('header.error'),
        text: t('header.errorSearchFailed'),
      });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-bar" ref={searchRef}>
      <div className="search-input-container">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder={t('header.searchPlaceholder')}
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onKeyPress={handleKeyPress}
        />
      </div>
      {showHistory && searchHistory.length > 0 && (
        <div className="search-history">
          {searchHistory.map((item, index) => (
            <div
              key={index}
              className="history-item"
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
      <div className="search-divider"></div>
      <LocationDropdown onLocationChange={setSelectedLocation} />
      <button className="search-button" onClick={handleSearch}>
        <i className="fas fa-search"></i>
      </button>
    </div>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
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
          setUnreadCount(await response.json());
        } catch (error) {
          console.error("Error fetching unread notification count:", error.message);
        }
      }
    };

    fetchUnreadCount();
  }, [user, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path, closeMobileMenu = true) => {
    navigate(path);
    if (closeMobileMenu) setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      logout();
      handleNavigation("/login");
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
      action: () => handleNavigation("/createEvent"),
    },
    {
      icon: "bi-heart",
      text: t('header.likes'),
      action: () => handleNavigation("/event-like"),
    },
    {
      icon: "bi-bell",
      text: t('header.noti'),
      action: () => handleNavigation("/notifications"),
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  const menuPopup = [
    {
      title: t('header.manageMyEvents'),
      action: () => handleNavigation("/dashboard"),
      roles: ["ORGANIZER", "TICKET MANAGER", "EVENT ASSISTANT", "CHECK-IN STAFF"],
    },
    {
      title: t('header.invoices'),
      action: () => handleNavigation("/myinvoices"),
      roles: ["ORGANIZER", "ATTENDEE"],
    },
    {
      title: t('header.yourTickets'),
      action: () => handleNavigation("/view-all-tickets"),
      roles: ["ORGANIZER", "ATTENDEE"],
    },
    {
      title: t('header.adminDashboard'),
      action: () => handleNavigation("/admin"),
      roles: ["ADMIN"],
    },
    {
      title: t('header.profile'),
      action: () => handleNavigation("/view"),
      roles: ["ATTENDEE"],
    },
    {
      title: t('header.upToOrganizer'),
      action: () => setOpenUpgradeDialog(true),
      roles: ["ATTENDEE"],
    },
    {
      title: t('header.logout'),
      action: handleLogout,
    },
  ];

  const filteredMenuPopup = menuPopup.filter(
    (item) => !item.roles || item.roles.some((role) => user?.primaryRoles?.includes(role))
  );

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo-section">
          <div className="header-logo" onClick={() => handleNavigation("/")}>
            <AiFillCodeSandboxCircle className="logo-icon" />
            <span>Event</span>
          </div>
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
        <div className="header-search">
          <SearchBar />
        </div>
        <nav className="header-nav" ref={menuRef}>
          {menuItems.map((item, index) => (
            <a
              key={index}
              className="nav-item"
              onClick={item.action}
            >
              <div className="nav-icon-container">
                <i className={`${item.icon}`}></i>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </div>
              <span>{item.text}</span>
            </a>
          ))}
          <div
            className="user-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={() => setIsMenuOpen(true)}
          >
            {user ? (
              <>
                <i className="fa-solid fa-user user-icon"></i>
                <span className="user-email">{user.email}</span>
                <i className="bi bi-chevron-down user-dropdown-icon"></i>
                {isMenuOpen && (
                  <div
                    className="user-dropdown"
                    onMouseLeave={() => setIsMenuOpen(false)}
                  >
                    {filteredMenuPopup.map((item, index) => (
                      <a
                        key={index}
                        className="dropdown-item"
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
                <a href="/login" className="auth-link">
                  {t('header.login')}
                </a>
                <a href="/signup" className="auth-link">
                  {t('header.signup')}
                </a>
              </>
            )}
          </div>
        </nav>
        {isMobileMenuOpen && (
          <nav className="mobile-menu" ref={mobileMenuRef}>
            {menuItems.map((item, index) => (
              <a
                key={index}
                className="mobile-nav-item"
                onClick={item.action}
              >
                <div className="nav-icon-container">
                  <i className={`${item.icon}`}></i>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </div>
                <span>{item.text}</span>
              </a>
            ))}
            {user ? (
              filteredMenuPopup.map((item, index) => (
                <a
                  key={index}
                  className="mobile-dropdown-item"
                  onClick={item.action}
                >
                  {item.title}
                </a>
              ))
            ) : (
              <>
                <a href="/login" className="mobile-auth-link">
                  {t('header.login')}
                </a>
                <a href="/signup" className="mobile-auth-link">
                  {t('header.signup')}
                </a>
              </>
            )}
          </nav>
        )}
        <UpgradeOrganizerDialog
          open={openUpgradeDialog}
          onClose={() => setOpenUpgradeDialog(false)}
        />
      </div>
    </header>
  );
};

export default Header;