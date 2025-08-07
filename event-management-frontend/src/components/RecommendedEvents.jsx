import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import Loader from "./Loading";
import { useAuth } from "../pages/Auth/AuthProvider";
import FavoriteButton from "./FavoriteButton";
import { CiCalendarDate, CiTimer, CiLocationOn } from "react-icons/ci";
import { FaEye } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

const ListEventScroll = ({ apiUrl, title, method = "GET", t }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const fetchEvents = async () => {
    try {
      if (!token) {
        throw new Error(t("recommendedEvents.error", { message: "Please log in to view recommendations" }));
      }

      const response = await fetch(apiUrl, {
        method: method, // Sử dụng phương thức được truyền vào
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Nếu là POST, có thể thêm body nếu cần (hiện tại API không yêu cầu body)
        ...(method === "POST" && { body: JSON.stringify({}) }),
      });

      if (!response.ok) {
        throw new Error(t("recommendedEvents.error", { message: `HTTP error! Status: ${response.status}` }));
      }

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : [...data]);
    } catch (error) {
      setError(error.message);
      console.error(`Error fetching events from ${apiUrl}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchEvents();
    } else {
      setLoading(false);
      setError(t("recommendedEvents.error", { message: "Please log in to view recommendations" }));
    }
  }, [apiUrl, user, token, method, t]);

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text || "";
    return text.substring(0, maxLength) + "...";
  };

  const sanitizeAndTruncate = (html, maxLength) => {
    const sanitizedHtml = DOMPurify.sanitize(html || "");
    const plainText = sanitizedHtml.replace(/<[^>]+>/g, "");
    if (plainText.length <= maxLength) {
      return sanitizedHtml;
    }
    const truncatedPlainText = truncateText(plainText, maxLength);
    return `<p>${truncatedPlainText}</p>`;
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const getLocation = (location) => {
    if (!location || (!location.venueName && !location.address && !location.city)) {
      return t("eventListSearch.online");
    }
    const parts = [
      location.venueName,
      location.address,
      location.city,
    ].filter((part) => part && part.trim() !== "");
    return parts.length > 0 ? parts.join(", ") : t("eventListSearch.online");
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-center text-red-600 sm:text-base">
        {error}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-4 text-sm text-center text-gray-600 sm:text-base">
        {/* {t("recommendedEvents.noEventsAvailable")} */}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
      <div className="flex items-center justify-between">
        <h2 className="mb-3 text-lg font-bold text-gray-800 sm:text-xl lg:text-2xl sm:mb-4 font-montserrat">
          {title}
        </h2>
        <div
          className="flex items-center gap-1 sm:gap-2 hover:cursor-pointer hover:text-red-500"
          onClick={() => navigate("/all-event")}
        >
          <p className="text-xs sm:text-sm lg:text-[15px] text-gray-600 hover:text-red-500">
            {t("recommendedEvents.viewAllEvents")}
          </p>
          <i className="text-xs fa-solid fa-circle-chevron-right sm:text-sm"></i>
        </div>
      </div>
      <div className="flex pb-4 space-x-3 overflow-x-auto sm:space-x-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {events.map((event) => (
          <div
            key={event.eventId}
            onClick={() => handleEventClick(event.eventId)}
            className="flex-none w-64 sm:w-72 lg:max-w-[300px] min-h-[360px] sm:min-h-[380px] lg:min-h-[400px] bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 cursor-pointer transition-shadow"
          >
            <div className="w-full h-32 overflow-hidden bg-gray-100 rounded-t-lg sm:h-36 lg:h-40">
              {event.eventImages && event.eventImages.length > 0 ? (
                <div
                  className="relative w-full h-full bg-center bg-cover"
                  style={{ backgroundImage: `url(${event.eventImages[0]})` }}
                >
                  {user && <FavoriteButton eventId={event.eventId} />}
                </div>
              ) : (
                <img
                  src="https://via.placeholder.com/300x150"
                  alt={t("eventListSearch.noImages")}
                  className="object-cover w-full h-full"
                />
              )}
            </div>

            <div className="p-3 sm:p-4">
              <h3 className="text-base font-semibold text-gray-900 truncate sm:text-lg">
                {truncateText(event.eventName, 25) || t("recommendedEvents.noDescription")}
              </h3>
              <p
                className="mt-1 text-xs text-gray-600 sm:text-sm"
                dangerouslySetInnerHTML={{
                  __html: event?.eventDesc
                    ? sanitizeAndTruncate(event.eventDesc, 30)
                    : t("recommendedEvents.noDescription"),
                }}
              />
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

            <div className="flex flex-wrap gap-1 px-3 pb-3 sm:px-4 sm:pb-4 sm:gap-2">
              {event.tags && typeof event.tags === "string" ? (
                event.tags.split("|").map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full"
                  >
                    {truncateText(tag.trim(), 10)}
                  </span>
                ))
              ) : (
                <span className="text-gray-600 text-[10px] sm:text-xs">
                  {t("recommendedEvents.noDescription")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecommendedEvents = () => {
  const { user } = useAuth();
  const email = user?.email;
  const userId = user?.userId;
  const { t } = useTranslation();

  if (!user || !userId) {
    return null; // Không hiển thị nếu chưa đăng nhập
  }

  return (
    <div className="w-full">
      <ListEventScroll
        apiUrl={`http://localhost:8080/api/events/recommended/${userId}`}
        title={t("recommendedEvents.youMightLike")}
        method="POST" // Chỉ định phương thức POST
        t={t}
      />
      <ListEventScroll
        apiUrl={`http://localhost:8080/api/events/recommended/by-types/${email}`}
        title={t("recommendedEvents.somePopularEvents")}
        method="GET" // Chỉ định phương thức GET
        t={t}
      />
    </div>
  );
};

export default RecommendedEvents;