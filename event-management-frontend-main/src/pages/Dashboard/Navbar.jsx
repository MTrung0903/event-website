import { RiMenuLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../Auth/api";
import { useAuth } from "../Auth/AuthProvider";
import Swal from "sweetalert2";

const Navbar = ({ toggleSidebar }) => {
  const { t } = useTranslation();

  return (
    <div className="py-1.5 sm:py-2 lg:py-2 px-4 sm:px-5 lg:px-6 bg-gray-100 flex items-center shadow shadow-black/5 sticky top-0 left-0 z-30 h-[45px] sm:h-[42px] lg:h-[55px]">
      <button
        type="button"
        className="text-base sm:text-lg lg:text-xl text-gray-900 font-semibold md:hidden"
        onClick={toggleSidebar}
        aria-label={t('navbar.toggleMenuAria')}
      >
        <RiMenuLine />
      </button>
      <ul className="ml-auto flex items-center space-x-4 sm:space-x-5 lg:space-x-6">
        <ProfileDropdown />
      </ul>
    </div>
  );
};

const ProfileDropdown = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await api.logout();
      logout();
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
        {user ? (
          <>
            <i className="fa-solid fa-user text-base sm:text-lg lg:text-lg"></i>
            <span className="text-[11px] sm:text-[12px] lg:text-[12px] truncate max-w-[150px] sm:max-w-[200px]">
              {user.email}
            </span>
          </>
        ) : (
          <>
            <a href="/login" className="text-gray-700 hover:underline text-xs sm:text-sm">
              {t('navbar.login')}
            </a>
            <a href="/signup" className="text-gray-700 hover:underline text-xs sm:text-sm">
              {t('navbar.signUp')}
            </a>
          </>
        )}
      </div>
      {user && (
        <ul className="absolute right-0 mt-2 w-32 sm:w-36 lg:w-40 py-1 sm:py-1.5 bg-white rounded-md shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 pt-1 sm:pt-2 pointer-events-auto">
          <li>
            <a
              href="#"
              className="block px-3 sm:px-4 py-1 sm:py-2 text-gray-600 hover:text-red-500 hover:bg-gray-50 transition-all duration-200 text-xs sm:text-sm"
              onClick={handleLogout}
            >
              {t('navbar.logOut')}
            </a>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Navbar;