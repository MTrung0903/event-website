import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";
import { useAuth } from "../pages/Auth/AuthProvider";
import { CiCalendarDate, CiTimer, CiLocationOn } from "react-icons/ci";
import { FaEye } from "react-icons/fa6";
import Loader from "./Loading";
import FavoriteButton from "./FavoriteButton";
import "./RecommendedEvents.css";

const EventCard = ({ event, onClick, user, t }) => {
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text || "";
    return text.substring(0, maxLength) + "...";
  };

  const sanitizeAndTruncate = (html, maxLength) => {
    const sanitizedHtml = DOMPurify.sanitize(html || "");
    const plainText = sanitizedHtml.replace(/<[^>]+>/g, "");
    if (plainText.length <= maxLength) return sanitizedHtml;
    return `<p>${truncateText(plainText, maxLength)}</p>`;
  };

  const getLocation = (location) => {
    if (!location || (!location.venueName && !location.address && !location.city)) {
      return t("eventListSearch.online");
    }
    const parts = [location.venueName, location.address, location.city].filter(
      (part) => part && part.trim() !== ""
    );
    return parts.length > 0 ? parts.join(", ") : t("eventListSearch.online");
  };

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-image-container">
        {event.eventImages && event.eventImages.length > 0 ? (
          <div
            className="event-image"
            style={{ backgroundImage: `url(${event.eventImages[0]})` }}
          >
            {user && <FavoriteButton eventId={event.eventId} />}
          </div>
        ) : (
          <img
            src="https://via.placeholder.com/300x150"
            alt={t("eventListSearch.noImages")}
            className="event-image-placeholder"
          />
        )}
      </div>
      <div className="event-details">
        <h3 className="event-title">
          {truncateText(event.eventName, 25) || t("recommendedEvents.noDescription")}
        </h3>
        <p
          className="event-description"
          dangerouslySetInnerHTML={{
            __html: event?.eventDesc
              ? sanitizeAndTruncate(event.eventDesc, 30)
              : t("recommendedEvents.noDescription"),
          }}
        />
        <div className="event-meta">
          <p className="event-date">
            <CiCalendarDate className="meta-icon" />
            {new Date(event.eventStart).toLocaleDateString("vi-VN")}
          </p>
          <p className="event-time">
            <CiTimer className="meta-icon" />
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
          <p className="event-location">
            <CiLocationOn className="meta-icon" />
            {getLocation(event.eventLocation)}
          </p>
          <p className="event-views">
            <FaEye className="meta-icon" />
            {event?.viewCount ? `${event.viewCount}` : "0"}
          </p>
        </div>
      </div>
      <div className="event-tags">
        {event.tags && typeof event.tags === "string" ? (
          event.tags.split("|").map((tag, index) => (
            <span key={index} className="tag">
              {truncateText(tag.trim(), 10)}
            </span>
          ))
        ) : (
          <span className="no-tags">{t("recommendedEvents.noDescription")}</span>
        )}
      </div>
    </div>
  );
};

const ListEventScroll = ({ apiUrl, title, method = "GET", t }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!token) {
          throw new Error(t("recommendedEvents.error", { message: "Please log in to view recommendations" }));
        }

        const response = await fetch(apiUrl, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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

    if (user && token) {
      fetchEvents();
    } else {
      setLoading(false);
      setError(t("recommendedEvents.error", { message: "Please log in to view recommendations" }));
    }
  }, [apiUrl, user, token, method, t]);

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        {error}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="no-events-container">
        <p className="no-events-text">{t("recommendedEvents.noEventsAvailable")}</p>
      </div>
    );
  }

  return (
    <div className="event-scroll-container">
      <div className="event-scroll-header">
        <h2 className="header-title">{title}</h2>
        <div className="view-all" onClick={() => navigate("/all-event")}>
          <p className="view-all-text">{t("recommendedEvents.viewAllEvents")}</p>
          <i className="fa-solid fa-circle-chevron-right"></i>
        </div>
      </div>
      <div className="event-scroll">
        {events.map((event) => (
          <EventCard
            key={event.eventId}
            event={event}
            onClick={() => handleEventClick(event.eventId)}
            user={user}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

const RecommendedEvents = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const email = user?.email;
  const userId = user?.userId;

  if (!user || !userId) {
    return null;
  }

  return (
    <div className="recommended-events">
      <ListEventScroll
        apiUrl={`http://localhost:8080/api/events/recommended/${userId}`}
        title={t("recommendedEvents.youMightLike")}
        method="POST"
        t={t}
      />
      <ListEventScroll
        apiUrl={`http://localhost:8080/api/events/recommended/by-types/${email}`}
        title={t("recommendedEvents.somePopularEvents")}
        method="GET"
        t={t}
      />
    </div>
  );
};

export default RecommendedEvents;