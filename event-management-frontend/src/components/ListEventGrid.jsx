import { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../pages/Auth/AuthProvider";
import DOMPurify from "dompurify";
import { CiCalendarDate, CiTimer, CiLocationOn } from "react-icons/ci";
import { FaEye } from "react-icons/fa6";
import Loader from "./Loading";
import FavoriteButton from "./FavoriteButton";
import "./ListEventGrid.css";

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
      return t("listEventGrid.online");
    }
    const parts = [location.venueName, location.address, location.city].filter(
      (part) => part && part.trim() !== ""
    );
    return parts.length > 0 ? parts.join(", ") : t("listEventGrid.online");
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
            src="https://via.placeholder.com/300x150?text=No+Image"
            alt={t("listEventGrid.noDescription")}
            className="event-image-placeholder"
          />
        )}
      </div>
      <div className="event-details">
        <h3 className="event-title">
          {truncateText(event.eventName, 30) || t("listEventGrid.noDescription")}
        </h3>
        <p
          className="event-description"
          dangerouslySetInnerHTML={{
            __html: event?.eventDesc
              ? sanitizeAndTruncate(event.eventDesc, 60)
              : t("listEventGrid.noDescription"),
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
              {truncateText(tag.trim(), 12)}
            </span>
          ))
        ) : (
          <span className="no-tags">{t("listEventGrid.noTags")}</span>
        )}
      </div>
    </div>
  );
};

const ListEventGrid = ({ events: propEvents }) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/events/search/upcoming");
      if (!response.ok) {
        throw new Error(t("listEventGrid.error", { message: "Failed to fetch events" }));
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeEvents = async () => {
      if (propEvents && propEvents.length > 0) {
        setEvents(propEvents);
        setLoading(false);
      } else {
        await fetchEvents();
      }
    };
    initializeEvents();
  }, [propEvents, t]);

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleViewAll = () => {
    setLoading(true);
    navigate("/all-event");
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
        {t("listEventGrid.error", { message: error })}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="no-events-container">
        <p className="no-events-text">{t("listEventGrid.noEvents")}</p>
      </div>
    );
  }

  return (
    <div className="event-grid-container">
      <div className="event-grid-header">
        <h2 className="header-title">{t("listEventGrid.upcomingEvents")}</h2>
        <button className="view-all-button" onClick={handleViewAll}>
          <span>{t("listEventGrid.viewAllEvents")}</span>
          <i className="fa-solid fa-circle-chevron-right"></i>
        </button>
      </div>
      <div className="event-grid">
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

export default ListEventGrid;