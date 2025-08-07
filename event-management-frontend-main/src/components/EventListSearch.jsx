import { useState, useEffect } from "react";
import { FaUserFriends } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';

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
    <div className="max-w-5xl mx-auto p-6 border-l-2 text-center">
      <p className="text-gray-500 text-lg">{t('eventListSearch.noEvents')}</p>
    </div>
  );
}

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#EEEEEE]">
      <div className="space-y-6">
        {event.map((eventItem) => (
          <div
            key={eventItem.eventId}
            className="flex items-center w-[730px] bg-white shadow rounded-[8px] overflow-hidden p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:cursor-pointer"
            onClick={() => handleEventClick(eventItem.eventId)}
          >
            {imageError[eventItem.eventId] ||
              !eventItem.eventImages ||
              eventItem.eventImages.length === 0 ||
              !isValidUrl(eventItem.eventImages[0]) ? (
              <div className="w-44 h-28 bg-gray-200 flex items-center justify-center rounded-lg">
                <p className="text-gray-500 text-sm">{t('eventListSearch.noImages')}</p>
              </div>
            ) : (
              <img
                src={eventItem.eventImages[0]}
                alt={eventItem.eventName}
                className="w-44 h-28 object-cover rounded-lg"
                onError={() => handleImageError(eventItem.eventId)}
              />
            )}
            <div className="ml-4 flex-1 text-[13px]">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{truncateText(eventItem.eventName, 55)}</h3>
              <div className="flex space-x-6 my-2">
                <p className="font-medium text-red-500 bg-blue-100 px-[4px] py-[2px] rounded-[4px]">{eventItem.eventType}</p>
                <p className="text-gray-500 px-[4px] py-[2px]">{eventItem.eventStart}</p>
              </div>
              <p className="text-gray-600">
                <i className="fa-solid fa-location-dot mr-2 text-orange-300"></i>
                {getLocation(eventItem.eventLocation)}
              </p>
              <div className="flex items-center text-gray-600 mt-1">
                <FaUserFriends className="mr-2 text-blue-500" /> {eventItem.eventHost}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;