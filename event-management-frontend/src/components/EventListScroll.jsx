import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { CiCalendarDate, CiTimer, CiLocationOn } from 'react-icons/ci';
import { FaEye } from 'react-icons/fa6';
import { useAuth } from '../pages/Auth/AuthProvider';
import Loader from './Loading';
import FavoriteButton from './FavoriteButton';
import './ListEventScroll.css';

// Component hiển thị danh sách sự kiện dạng cuộn ngang
const ListEventScroll = ({ events: propEvents }) => {
  const { t } = useTranslation();
  const [events, setLocalEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hàm lấy danh sách sự kiện nổi bật từ API
  const fetchTopEvents = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/events/search/events-by-favorites');
      if (!response.ok) {
        throw new Error(t('eventListScroll.errorFetch'));
      }
      const data = await response.json();
      setLocalEvents(data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo danh sách sự kiện
  useEffect(() => {
    const initializeEvents = async () => {
      if (propEvents && propEvents.length > 0) {
        setLocalEvents(propEvents);
        setLoading(false);
      } else {
        await fetchTopEvents();
      }
    };
    initializeEvents();
  }, [propEvents, t]);

  // Cắt ngắn văn bản nếu vượt quá độ dài tối đa
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  };

  // Làm sạch HTML và cắt ngắn nếu cần
  const sanitizeAndTruncate = (html, maxLength) => {
    const sanitizedHtml = DOMPurify.sanitize(html || '');
    const plainText = sanitizedHtml.replace(/<[^>]+>/g, '');
    if (plainText.length <= maxLength) {
      return sanitizedHtml;
    }
    const truncatedPlainText = truncateText(plainText, maxLength);
    return `<p>${truncatedPlainText}</p>`;
  };

  // Điều hướng đến trang chi tiết sự kiện
  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  // Điều hướng đến trang danh sách tất cả sự kiện
  const handleViewAll = () => {
    setLoading(true);
    navigate('/all-event');
  };

  // Lấy thông tin địa điểm
  const getLocation = (location) => {
    if (!location || (!location.venueName && !location.address && !location.city)) {
      return t('eventListScroll.online');
    }
    const parts = [
      location.venueName,
      location.address,
      location.city,
    ].filter((part) => part && part.trim() !== '');
    return parts.length > 0 ? parts.join(', ') : t('eventListScroll.online');
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="loading-container">
        <Loader />
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">{t('eventListScroll.error', { message: error })}</p>
      </div>
    );
  }

  // Hiển thị thông báo không có sự kiện
  if (!events || events.length === 0) {
    return (
      <div className="no-events-container">
        <p className="no-events-text">{t('eventListScroll.noEvents')}</p>
      </div>
    );
  }

  return (
    <div className="list-event-scroll-container">
      <div className="list-event-scroll-header">
        <h2 className="list-event-scroll-title">{t('eventListScroll.topNotableEvents')}</h2>
        <div className="view-all-container" onClick={handleViewAll}>
          <p className="view-all-text">{t('eventListScroll.viewAllEvents')}</p>
          <i className="view-all-icon fa-solid fa-circle-chevron-right"></i>
        </div>
      </div>
      <div className="events-list">
        {events.map((event) => (
          <div
            key={event.eventId}
            onClick={() => handleEventClick(event.eventId)}
            className="event-card"
          >
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
                  alt="Default Event"
                  className="event-image-default"
                />
              )}
            </div>
            <div className="event-content">
              <h3 className="event-title">
                {truncateText(event.eventName, 25) || 'Unnamed Event'}
              </h3>
              <p
                className="event-description"
                dangerouslySetInnerHTML={{
                  __html: event?.eventDesc
                    ? sanitizeAndTruncate(event.eventDesc, 30)
                    : t('eventListScroll.noDescription'),
                }}
              />
              <p className="event-info">
                <CiCalendarDate className="event-info-icon" />
                {new Date(event.eventStart).toLocaleDateString('vi-VN')}
              </p>
              <p className="event-info">
                <CiTimer className="event-info-icon" />
                {new Date(event.eventStart).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {new Date(event.eventEnd).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="event-info">
                <CiLocationOn className="event-info-icon" />
                {getLocation(event.eventLocation)}
              </p>
              <p className="event-info">
                <FaEye className="event-info-icon" />
                {event?.viewCount ? `${event.viewCount}` : '0'}
              </p>
            </div>
            <div className="event-tags">
              {event.tags && typeof event.tags === 'string' ? (
                event.tags.split('|').map((tag, index) => (
                  <span key={index} className="event-tag">
                    {truncateText(tag.trim(), 10)}
                  </span>
                ))
              ) : (
                <span className="event-tag-empty">{t('eventListScroll.noTags')}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListEventScroll;