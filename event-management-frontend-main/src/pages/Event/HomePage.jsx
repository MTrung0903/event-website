import { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import SliderEvent from "../../components/SliderEvent";
import Footer from "../../components/Footer";
import { useRef } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
} from "react-icons/fa";

import ListEventScroll from "../../components/EventListScroll";
import Loader from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import ListEventGrid from "../../components/ListEventGrid";
import RecommendedEvents from "../../components/RecommendedEvents";
import { useTranslation } from "react-i18next";

const popularCities = [
  {
    key: "ho-chi-minh",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f4/Ho_Chi_Minh_City_panorama_2019_%28cropped2%29.jpg",
  },
  {
    key: "ha-noi",
    image:
      "https://tse4.mm.bing.net/th?id=OIP.TG6asWNB6eXi1qmyBhK0MgHaE8&pid=Api",
  },
  {
    key: "da-nang",
    image:
      "https://tse3.mm.bing.net/th?id=OIP.-VeJDm4d4pGItJ2dW1sPhwHaEW&pid=Api",
  },
  {
    key: "hoi-an",
    image:
      "https://tse1.mm.bing.net/th?id=OIP.yaHI0xalsVOhjJrMLgwd0gHaEj&pid=Api",
  },
  {
    key: "nha-trang",
    image:
      "https://tse3.mm.bing.net/th?id=OIP.lmOSh4__DVScQiGPX_z8gAHaE7&pid=Api",
  },
  {
    key: "da-lat",
    image:
      "https://tse1.mm.bing.net/th?id=OIP.28LZalVpUhcZFkoxUzgPSAHaFj&pid=Api",
  },
  {
    key: "hue",
    image:
      "https://tse2.mm.bing.net/th?id=OIP.GjTvs6qKXyVBVqZEr_28xgHaJQ&pid=Api",
  },
  {
    key: "phu-quoc",
    image:
      "https://tse3.mm.bing.net/th?id=OIP.iD5WJa5kTTqnP83rCyg72QHaE7&pid=Api",
  },
  {
    key: "sa-pa",
    image:
      "https://tse3.mm.bing.net/th?id=OIP.vhiR4v7kpNaiZ2JBTogiewHaE8&pid=Api",
  },
  {
    key: "can-tho",
    image:
      "https://tse3.mm.bing.net/th?id=OIP.3QDMqoVp2iw0o9c82hgDQgHaEK&pid=Api",
  },
  {
    key: "haiphong",
    image:
      "https://tse2.mm.bing.net/th?id=OIP.5LC-cqmLjYiCVWjENF7hbAHaFK&pid=Api",
  },
];

const Navbar = ({ setCityEvents }) => {
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState(t('homePage.locations.all-location'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const token = localStorage.getItem("token");

  const locations = [
    { slug: "all-location" },
    { slug: "ho-chi-minh" },
    { slug: "ha-noi" },
    { slug: "da-nang" },
    { slug: "hai-phong" },
    { slug: "can-tho" },
    { slug: "nha-trang" },
    { slug: "da-lat" },
    { slug: "binh-duong" },
    { slug: "dong-nai" },
    { slug: "quang-ninh" },
    { slug: "bac-lieu" },
    { slug: "hoi-an" },
    { slug: "hue" },
    { slug: "phu-quoc" },
    { slug: "sa-pa" },
    { slug: "an-giang" },
    { slug: "ba-ria-vung-tau" },
    { slug: "bac-giang" },
    { slug: "bac-kan" },
    { slug: "bac-ninh" },
    { slug: "ben-tre" },
    { slug: "binh-dinh" },
    { slug: "binh-phuoc" },
    { slug: "binh-thuan" },
    { slug: "ca-mau" },
    { slug: "cao-bang" },
    { slug: "dak-lak" },
    { slug: "dak-nong" },
    { slug: "dien-bien" },
    { slug: "dong-thap" },
    { slug: "gia-lai" },
    { slug: "ha-giang" },
    { slug: "ha-nam" },
    { slug: "ha-tinh" },
    { slug: "hai-duong" },
    { slug: "hau-giang" },
    { slug: "hoa-binh" },
    { slug: "hung-yen" },
    { slug: "khanh-hoa" },
    { slug: "kien-giang" },
    { slug: "kon-tum" },
    { slug: "lai-chau" },
    { slug: "lam-dong" },
    { slug: "lang-son" },
    { slug: "lao-cai" },
    { slug: "long-an" },
    { slug: "nam-dinh" },
    { slug: "nghe-an" },
    { slug: "ninh-binh" },
    { slug: "ninh-thuan" },
    { slug: "phu-tho" },
    { slug: "phu-yen" },
    { slug: "quang-binh" },
    { slug: "quang-nam" },
    { slug: "quang-ngai" },
    { slug: "soc-trang" },
    { slug: "son-la" },
    { slug: "tay-ninh" },
    { slug: "thai-binh" },
    { slug: "thai-nguyen" },
    { slug: "thanh-hoa" },
    { slug: "thua-thien-hue" },
    { slug: "tien-giang" },
    { slug: "tra-vinh" },
    { slug: "tuyen-quang" },
    { slug: "vinh-long" },
    { slug: "vinh-phuc" },
    { slug: "yen-bai" }
  ];

  const fetchEventsByCity = async (citySlug) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/events/search/by-city/${citySlug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events by city");
      }
      const data = await response.json();
      setCityEvents(data);
    } catch (error) {
      console.error("Error fetching events by city:", error);
      setCityEvents([]);
    }
  };

  return (
    <div className="bg-white w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-2">
      {/* Location Section */}
      <div className="relative flex items-center space-x-2">
        <span className="text-xs font-semibold sm:text-sm lg:text-lg">
          {t('homePage.browsingEvents')}
        </span>
        <div className="relative inline-block">
          <button
            className="text-blue-800 font-semibold rounded-md px-2 sm:px-3 lg:px-4 py-1 bg-white flex items-center justify-start w-[120px] sm:w-[150px] lg:w-[180px] text-xs sm:text-sm lg:text-base"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedLocation}
            <i className="ml-1 text-xs text-blue-800 bi bi-chevron-down sm:ml-2 sm:text-sm"></i>
          </button>
          {isDropdownOpen && (
            <div
              className="absolute left-0 mt-1 w-[120px] sm:w-[150px] lg:w-[180px] bg-white shadow-lg border rounded-lg py-1 sm:py-2 z-10"
              style={{ maxHeight: '200px', overflowY: 'auto' }}
            >
              {locations.map((location) => (
                <div
                  key={location.slug}
                  className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 cursor-pointer flex justify-between items-center hover:bg-blue-100 transition duration-200 text-xs sm:text-sm ${selectedLocation === t("homePage.locations." + `${location.slug}`)
                    ? "text-blue-800 font-semibold"
                    : "text-gray-700"
                    }`}
                  onClick={() => {
                    setSelectedLocation(t("homePage.locations." + `${location.slug}`));
                    fetchEventsByCity(location.slug === 'all-location' ? '' : location.slug);
                    setIsDropdownOpen(false);
                  }}
                >
                  {t("homePage.locations." + `${location.slug}`)}
                  {selectedLocation === t("homePage.locations." + `${location.slug}`) && (
                    <i className="text-blue-800 bi bi-check"></i>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TopDestinations = () => {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [topCities, setTopCities] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const animationRef = useRef(null);

  // Danh sách ánh xạ slug và tên thành phố (đầy đủ 63 tỉnh/thành phố)
  const locations = [
    { slug: "ho-chi-minh", name: "TP. Hồ Chí Minh" },
    { slug: "ha-noi", name: "Hà Nội" },
    { slug: "da-nang", name: "Đà Nẵng" },
    { slug: "hai-phong", name: "Hải Phòng" },
    { slug: "can-tho", name: "Cần Thơ" },
    { slug: "nha-trang", name: "Nha Trang" },
    { slug: "da-lat", name: "Đà Lạt" },
    { slug: "binh-duong", name: "Bình Dương" },
    { slug: "dong-nai", name: "Đồng Nai" },
    { slug: "quang-ninh", name: "Quảng Ninh" },
    { slug: "bac-lieu", name: "Bạc Liêu" },
    { slug: "an-giang", name: "An Giang" },
    { slug: "ba-ria-vung-tau", name: "Bà Rịa - Vũng Tàu" },
    { slug: "bac-giang", name: "Bắc Giang" },
    { slug: "bac-kan", name: "Bắc Kạn" },
    { slug: "bac-ninh", name: "Bắc Ninh" },
    { slug: "ben-tre", name: "Bến Tre" },
    { slug: "binh-dinh", name: "Bình Định" },
    { slug: "binh-phuoc", name: "Bình Phước" },
    { slug: "binh-thuan", name: "Bình Thuận" },
    { slug: "ca-mau", name: "Cà Mau" },
    { slug: "cao-bang", name: "Cao Bằng" },
    { slug: "dak-lak", name: "Đắk Lắk" },
    { slug: "dak-nong", name: "Đắk Nông" },
    { slug: "dien-bien", name: "Điện Biên" },
    { slug: "dong-thap", name: "Đồng Tháp" },
    { slug: "gia-lai", name: "Gia Lai" },
    { slug: "ha-giang", name: "Hà Giang" },
    { slug: "ha-nam", name: "Hà Nam" },
    { slug: "ha-tinh", name: "Hà Tĩnh" },
    { slug: "hai-duong", name: "Hải Dương" },
    { slug: "hau-giang", name: "Hậu Giang" },
    { slug: "hoa-binh", name: "Hòa Bình" },
    { slug: "hung-yen", name: "Hưng Yên" },
    { slug: "khanh-hoa", name: "Khánh Hòa" },
    { slug: "kien-giang", name: "Kiên Giang" },
    { slug: "kon-tum", name: "Kon Tum" },
    { slug: "lai-chau", name: "Lai Châu" },
    { slug: "lam-dong", name: "Lâm Đồng" },
    { slug: "lang-son", name: "Lạng Sơn" },
    { slug: "lao-cai", name: "Lào Cai" },
    { slug: "long-an", name: "Long An" },
    { slug: "nam-dinh", name: "Nam Định" },
    { slug: "nghe-an", name: "Nghệ An" },
    { slug: "ninh-binh", name: "Ninh Bình" },
    { slug: "ninh-thuan", name: "Ninh Thuận" },
    { slug: "phu-tho", name: "Phú Thọ" },
    { slug: "phu-yen", name: "Phú Yên" },
    { slug: "quang-binh", name: "Quảng Bình" },
    { slug: "quang-nam", name: "Quảng Nam" },
    { slug: "quang-ngai", name: "Quảng Ngãi" },
    { slug: "soc-trang", name: "Sóc Trăng" },
    { slug: "son-la", name: "Sơn La" },
    { slug: "tay-ninh", name: "Tây Ninh" },
    { slug: "thai-binh", name: "Thái Bình" },
    { slug: "thai-nguyen", name: "Thái Nguyên" },
    { slug: "thanh-hoa", name: "Thanh Hóa" },
    { slug: "hue", name: "Huế" },
    { slug: "tien-giang", name: "Tiền Giang" },
    { slug: "tra-vinh", name: "Trà Vinh" },
    { slug: "tuyen-quang", name: "Tuyên Quang" },
    { slug: "vinh-long", name: "Vĩnh Long" },
    { slug: "vinh-phuc", name: "Vĩnh Phúc" },
    { slug: "yen-bai", name: "Yên Bái" },
  ];

  // Fetch top cities từ API
  useEffect(() => {
    const fetchTopCities = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/events/search/top-cities-popular"
        );
        const cities = await response.json();
        setTopCities(cities);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thành phố:", error);
        setTopCities([
          "Đà Nẵng",
          "TP. Hồ Chí Minh",
          "Hà Nội",
          "Bạc Liêu",
          "Hải Phòng",
          "Nha Trang",
          "Cần Thơ",
          "Quảng Ninh",
        ]);
      }
    };
    fetchTopCities();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (!scrollRef.current || isHovering) return;

    const scrollContainer = scrollRef.current;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;

    const scrollStep = () => {
      if (scrollContainer.scrollLeft >= scrollWidth - clientWidth) {
        scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollContainer.scrollLeft += 1;
      }
      animationRef.current = requestAnimationFrame(scrollStep);
    };

    animationRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovering]);

  const handleSearchByCity = async (city) => {
    try {
      const cityObj = locations.find(
        (loc) => loc.name.toLowerCase() === city.trim().toLowerCase()
      );
      if (!cityObj) {
        console.error(`Không tìm thấy slug cho thành phố: ${city}`);
        return;
      }
      const citySlug = cityObj.slug;

      const response = await fetch(
        `http://localhost:8080/api/events/search/by-city/${citySlug}`
      );
      const listEvent = await response.json();
      navigate("/search", { state: { events: listEvent } });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sự kiện:", error);
    }
  };

  return (
    <div className="bg-gray-50 text-gray-900 w-full max-w-[1280px] mx-auto p-4 sm:p-6">
      <h1 className="mb-4 text-lg font-bold text-center sm:text-xl lg:text-2xl sm:mb-6">
        {t("homePage.topDestinations")}
      </h1>
      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          ref={scrollRef}
          className="flex pb-4 space-x-3 overflow-x-auto sm:space-x-4 scroll-smooth scrollbar-hidden"
        >
          {popularCities.concat(popularCities).map((dest, index) => (
            <div key={index} className="flex-none w-48 sm:w-56 lg:w-64">
              <div className="relative">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="object-cover w-full rounded-lg h-36 sm:h-40 lg:h-48"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 rounded-b-lg bg-gradient-to-t from-red-600 to-transparent sm:p-3 lg:p-4">
                  <span className="text-base font-bold text-white sm:text-lg lg:text-xl">
                    {dest.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <h2 className="mt-6 mb-3 text-base font-bold sm:text-lg lg:text-xl sm:mt-8 sm:mb-4">
        {t("homePage.popularCity")}
      </h2>
      <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
        {topCities.map((city, index) => (
          <a
            key={index}
            onClick={() => handleSearchByCity(city)}
            className="flex items-center px-3 py-1 space-x-1 text-xs text-gray-900 bg-white rounded-full shadow-sm sm:px-4 sm:py-2 sm:space-x-2 sm:text-sm lg:text-base hover:cursor-pointer hover:bg-gray-100"
          >
            <span>{t("homePage.eventsAt", { city })}</span>
            <FaExternalLinkAlt className="text-xs sm:text-sm" />
          </a>
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {

  const { user } = useAuth();
  const [cityEvents, setCityEvents] = useState([]);

  return (
    <div className="flex flex-col min-h-screen">
      <SliderEvent />
      {/* <EventListings /> */}
      <RecommendedEvents />
      <Navbar setCityEvents={setCityEvents} />
      <ListEventScroll events={cityEvents} setEvents={setCityEvents} />
      <ListEventGrid />
      <TopDestinations />
      <Footer />
    </div>
  )
};
export default HomePage;
