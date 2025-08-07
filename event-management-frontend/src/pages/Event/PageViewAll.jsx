import { useState, useEffect } from "react";
import Loader from "../../components/Loading";
import Footer from "../../components/Footer";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import FavoriteButton from "../../components/FavoriteButton";
import DOMPurify from "dompurify";
import { CiCalendarDate, CiTimer, CiLocationOn } from "react-icons/ci";
import { FaEye } from "react-icons/fa6";
import { useTranslation } from "react-i18next"; // Import useTranslation

const popularCities = [
  {
    key: "ho-chi-minh",
    name: "Tp.Hồ Chí Minh",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f4/Ho_Chi_Minh_City_panorama_2019_%28cropped2%29.jpg",
  },
  {
    key: "ha-noi",
    name: "Hà Nội",
    image:
      "https://tse4.mm.bing.net/th?id=OIP.TG6asWNB6eXi1qmyBhK0MgHaE8&pid=Api",
  },
  {
    key: "da-nang",
    name: "Đà Nẵng",
    image:
      "https://tse3.mm.bing.net/th?id=OIP.-VeJDm4d4pGItJ2dW1sPhwHaEW&pid=Api",
  },
  {
    key: "hoi-an",
    name: "Hội An",
    image:
      "https://tse1.mm.bing.net/th?id=OIP.yaHI0xalsVOhjJrMLgwd0gHaEj&pid=Api",
  },
  {
    key: "nha-trang",
    name: "Nha Trang",
    image:
      "https://tse3.mm.bing.net/th?id=OIP.lmOSh4__DVScQiGPX_z8gAHaE7&pid=Api",
  },
  {
    key: "da-lat",
    name: "Đà Lạt",
    image:
      "https://tse1.mm.bing.net/th?id=OIP.28LZalVpUhcZFkoxUzgPSAHaFj&pid=Api",
  },
  {
    key: "hue",
    name: "Huế",
    image:
      "https://tse2.mm.bing.net/th?id=OIP.GjTvs6qKXyVBVqZEr_28xgHaJQ&pid=Api",
  },
  {
    key: "phu-quoc",
    name: "Phú Quốc",
    image:
      "https://tse3.mm.bing.net/th?id=OIP.iD5WJa5kTTqnP83rCyg72QHaE7&pid=Api",
  },
  {
    key: "sa-pa",
    name: "Sa Pa",
    image:
      "https://tse3.mm.bing.net/th?id=OIP.vhiR4v7kpNaiZ2JBTogiewHaE8&pid=Api",
  },
  {
    key: "can-tho",
    name: "Cần Thơ",
    image:
      "https://tse3.mm.bing.net/th?id=OIP.3QDMqoVp2iw0o9c82hgDQgHaEK&pid=Api",
  },
  {
    key: "haiphong",
    name: "Hải Phòng",
    image:
      "https://tse2.mm.bing.net/th?id=OIP.5LC-cqmLjYiCVWjENF7hbAHaFK&pid=Api",
  },
];

// Hàm rút gọn văn bản
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const AllEvent = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const eventsPerPage = 8;
  const token = localStorage.getItem("token");

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };
  const { t } = useTranslation();
  const fetchAllEvents = async () => {

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8080/api/events/all");
      if (!response.ok) {
        throw new Error("Không thể tải danh sách sự kiện");
      }
      const data = await response.json();
      setEvents(data);
      setDisplayedEvents(data.slice(0, eventsPerPage)); // Hiển thị trang đầu tiên
    } catch (error) {
      setError(error.message);
      console.error("Lỗi khi tải sự kiện:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, [t]);

  const sanitizeAndTruncate = (html, maxLength) => {
    const sanitizedHtml = DOMPurify.sanitize(html || "");
    const plainText = sanitizedHtml.replace(/<[^>]+>/g, "");
    if (plainText.length <= maxLength) {
      return sanitizedHtml;
    }
    const truncatedPlainText = truncateText(plainText, maxLength);
    return `<p>${truncatedPlainText}</p>`;
  };

  const handleViewMore = () => {
    if (displayedEvents.length >= events.length) return;

    setIsLoading(true);

    setTimeout(() => {
      const startIndex = page * eventsPerPage;
      const endIndex = startIndex + eventsPerPage;
      const newEvents = events.slice(startIndex, endIndex);
      setDisplayedEvents((prevEvents) => [...prevEvents, ...newEvents]);
      setPage((prevPage) => prevPage + 1);
      setIsLoading(false);
    }, 400); // Hiển thị Loader trong 0.4 giây
  };
  const getLocation = (location) => {
    if (!location || (!location.venueName && !location.address && !location.city)) {
      return "Online";
    }
    const parts = [
      location.venueName,
      location.address,
      location.city,
    ].filter((part) => part && part.trim() !== "");
    return parts.length > 0 ? parts.join(", ") : "Online";
  };
  if (isLoading && displayedEvents.length === 0) {
    return (
      <div className="p-4 text-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        {t("pageViewAll.error", { message: error })}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        {t("pageViewAll.noEvents")}
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-[1280px] mx-auto px-8 py-4 relative">
        <div
          className="relative h-[350px] rounded-[20px] my-8 bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `url('https://cdn.evbstatic.com/s3-build/fe/build/images/39ac4703250a1d0fb15911c2c5f10174-generic_1_desktop.webp')`,
          }}
        >
          {/* Lớp phủ để làm mờ và tăng độ tương phản cho nội dung */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>

          {/* Nội dung */}
          <div className="relative flex flex-col items-start justify-center h-full px-4 text-center">
            <h1 className="font-mono text-4xl font-bold text-white md:text-5xl drop-shadow-lg">
              {t("pageViewAll.popularEvents")} {/* Translated "Popular Events" */}
            </h1>
            <h2 className="mt-2 font-mono text-lg text-gray-200 md:text-xl drop-shadow-md">
              {t("pageViewAll.discoverPrompt")} {/* Translated prompt */}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedEvents.map((event) => (
            <div
              key={event.eventId}
              onClick={() => handleEventClick(event.eventId)}
              className="max-w-[300px] min-h-[400px] bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 cursor-pointer transition-shadow"
            >
              {/* Hình ảnh sự kiện */}
              <div className="w-full h-40 overflow-hidden bg-gray-100 rounded-t-lg">
                {event.eventImages && event.eventImages.length > 0 ? (

                  // Trong một component khác, ví dụ SearchPage
                  <div
                    className="relative w-full h-full bg-center bg-cover"
                    style={{ backgroundImage: `url(${event.eventImages[0]})` }}
                  >
                    <FavoriteButton eventId={event.eventId} />
                  </div>
                ) : (
                  <img
                    src="https://via.placeholder.com/300x150"
                    alt={t("pageViewAll.unnamedEvent")}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>

              {/* Thông tin sự kiện */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {truncateText(event.eventName, 25) || t("pageViewAll.unnamedEvent")} 
                </h3>
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {event?.eventDesc ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: sanitizeAndTruncate(event.eventDesc, 30),
                      }}
                    />
                  ) : (
                    "No description available"
                  )}
                </p>
                <p className="mt-1 text-xs text-gray-700 sm:text-sm sm:mt-2">
                  <CiCalendarDate className="inline-block mr-1" />{" "}
                  {new Date(event.eventStart).toLocaleDateString("vi-VN")}
                </p>
                <p className="text-xs text-gray-700 sm:text-sm">
                  <CiTimer className="inline-block mr-1" />{" "}
                  {new Date(event.eventStart).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(event.eventEnd).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="mt-1 text-xs text-gray-700 truncate sm:text-sm">
                  <CiLocationOn className="inline-block mr-1" />{" "}
                  {getLocation(event.eventLocation)}
                </p>
                <p className="mt-1 text-xs text-gray-700 sm:text-sm">
                  <FaEye className="inline-block mr-1" />{" "}
                  {event?.viewCount ? `${event.viewCount}` : "0"}
                </p>


              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                {event.tags && typeof event.tags === "string" ? (
                  event.tags.split("|").map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full"
                    >
                      {truncateText(tag.trim(), 10)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-600">{t("pageViewAll.noTags")}</span> 
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Nút View More hoặc Loader */}
        {displayedEvents.length < events.length && (
          <div className="flex justify-center mt-6">
            {isLoading ? (
              <Loader />
            ) : (
              <button
                onClick={handleViewMore}
                className="px-12 py-4  text-[#6F8579] rounded-[4px] hover:bg-gray-100 transition-colors border border-[#C2C4D0]"
              >
                {t("pageViewAll.viewMore")}
                <i className="ml-2 fa-solid fa-circle-chevron-down"></i>
              </button>
            )}
          </div>
        )}
        <h2 className="mt-6 mb-3 text-base font-bold sm:text-lg lg:text-xl sm:mt-8 sm:mb-4">
          {t("pageViewAll.popularCities")}
        </h2>
        <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
          {popularCities.map((city, index) => (
            <a
              key={index}

              className="flex items-center px-3 py-1 space-x-1 text-xs text-gray-900 bg-white rounded-full shadow-sm sm:px-4 sm:py-2 sm:space-x-2 sm:text-sm lg:text-base"
            >
              <span>{t("pageViewAll.thingsToDoIn", { city: city.name })}</span>

            </a>
          ))}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AllEvent;
