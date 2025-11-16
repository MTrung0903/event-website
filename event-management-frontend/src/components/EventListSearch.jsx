import { useState, useEffect } from "react";
import { FaUserFriends } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';
import './EventList.css';

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const EventList = ({ event }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState({});

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text || "";
    return text.substring(0, maxLength) + "...";
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleImageError = (eventId) => {
    setImageError((prev) => ({ ...prev, [eventId]: true }));
  };

  const getLocation = (location) => {
    if (!location || (!location.venueName && !location.address && !location.city)) {
      return t('eventListSearch.online');
    }
    const parts = [
      location.venueName,
      location.address,
      location.city,
    ].filter((part) => part && part.trim() !== "");
    return parts.length > 0 ? parts.join(", ") : t('eventListSearch.online');
  };

  if (!event || event.length === 0) {
    return (
      <div className="event-list-container event-list-no-events">
        <p className="no-events-text">{t('eventListSearch.noEvents')}</p>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      <div className="event-list">
        {event.map((eventItem) => (
          <div
            key={eventItem.eventId}
            className="event-card"
            onClick={() => handleEventClick(eventItem.eventId)}
          >
            {imageError[eventItem.eventId] ||
              !eventItem.eventImages ||
              eventItem.eventImages.length === 0 ||
              !isValidUrl(eventItem.eventImages[0]) ? (
              <div className="event-image-placeholder">
                <p className="no-image-text">{t('eventListSearch.noImages')}</p>
              </div>
            ) : (
              <img
                src={eventItem.eventImages[0]}
                alt={eventItem.eventName}
                className="event-image"
                onError={() => handleImageError(eventItem.eventId)}
              />
            )}
            <div className="event-details">
              <h3 className="event-title">{truncateText(eventItem.eventName, 55)}</h3>
              <div className="event-meta">
                <p className="event-type">{eventItem.eventType}</p>
                <p className="event-date">{eventItem.eventStart}</p>
              </div>
              <p className="event-location">
                <i className="fa-solid fa-location-dot event-location-icon"></i>
                {getLocation(eventItem.eventLocation)}
              </p>
              <div className="event-host">
                <FaUserFriends className="host-icon" /> {eventItem.eventHost}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;