import { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import Loader from "./Loading";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../pages/Auth/AuthProvider";
import DOMPurify from "dompurify";
import FavoriteButton from "./FavoriteButton";
import { CiCalendarDate, CiTimer, CiLocationOn } from "react-icons/ci";
import { FaEye } from "react-icons/fa6";
import { useTranslation } from "react-i18next"; // Import useTranslation

const ListEventGrid = ({ events: propEvents }) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [events, setLocalEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchAllEvent = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/events/search/upcoming");
      if (!response.ok) {
        throw new Error(t("listEventGrid.error", { message: "Failed to fetch events" })); // Translated error
      }
      const data = await response.json();
      setLocalEvents(data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeEvents = async () => {
      console.log("propEvents:", propEvents);
      if (propEvents && propEvents.length > 0) {
        console.log("Using propEvents");
        setLocalEvents(propEvents);
        setLoading(false);
      } else {
        console.log("Calling fetchAllEvent");
        await fetchAllEvent();
      }
    };
    initializeEvents();
  }, [t]); // Add t to dependencies for language changes

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

  const handlePageAll = () => {
    setLoading(true);
    navigate("/all-event");
  };

  const getLocation = (location) => {
    if (!location || (!location.venueName && !location.address && !location.city)) {
      return t("listEventGrid.online"); // Translated "Online"
    }
    const parts = [location.venueName, location.address, location.city].filter(
      (part) => part && part.trim() !== ""
    );
    return parts.length > 0 ? parts.join(", ") : t("listEventGrid.online");
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm font-medium text-center text-red-600 sm:text-base">
        {t("listEventGrid.error", { message: error })} {/* Translated error */}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm font-medium text-gray-600 sm:text-base">
          {t("listEventGrid.noEvents")} {/* Translated "No events available" */}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl lg:text-4xl font-montserrat">
          {t("listEventGrid.upcomingEvents")} {/* Translated "Upcoming Events" */}
        </h2>
        <button
          onClick={handlePageAll}
          className="flex items-center gap-2 text-sm text-gray-600 transition duration-200 sm:text-base hover:text-red-600"
        >
          <span>{t("listEventGrid.viewAllEvents")}</span> {/* Translated "View all events" */}
          <i className="text-sm fa-solid fa-circle-chevron-right sm:text-base"></i>
        </button>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {events.map((event) => (
          <div
            key={event.eventId}
            onClick={() => handleEventClick(event.eventId)}
            className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm cursor-pointer group rounded-xl hover:shadow-xl hover:-translate-y-1"
          >
            {/* Event Image */}
            <div className="relative w-full h-40 overflow-hidden bg-gray-100 sm:h-48">
              {event.eventImages && event.eventImages.length > 0 ? (
                <div
                  className="w-full h-full transition-transform duration-300 bg-center bg-cover group-hover:scale-102"
                  style={{ backgroundImage: `url(${event.eventImages[0]})` }}
                >
                  {user && <FavoriteButton eventId={event.eventId} />}
                </div>
              ) : (
                <img
                  src="https://via.placeholder.com/300x150?text=No+Image"
                  alt={t("listEventGrid.noDescription")} // Translated alt text
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-102"
                />
              )}
            </div>

            {/* Event Details */}
            <div className="p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl line-clamp-1">
                {truncateText(event.eventName, 30) || t("listEventGrid.noDescription")} {/* Fallback */}
              </h3>
              <p
                className="mt-2 text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: event?.eventDesc
                    ? sanitizeAndTruncate(event.eventDesc, 60)
                    : t("listEventGrid.noDescription"), // Translated fallback
                }}
              />
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p className="mt-1 text-xs text-gray-700 sm:text-sm">
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
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {event.tags && typeof event.tags === "string" ? (
                event.tags.split("|").map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs text-red-700 bg-red-100 rounded-full"
                  >
                    {truncateText(tag.trim(), 12)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-600">{t("listEventGrid.noTags")}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListEventGrid;