import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import FavoriteButton from "../../components/FavoriteButton";
import { useParams } from 'react-router-dom';
import { useAuth } from "../Auth/AuthProvider";
import DOMPurify from "dompurify";
import Footer from "../../components/Footer";

const ProfileOrganizer = () => {
  const { t } = useTranslation();
  const { organizerName } = useParams();
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [organizerData, setOrganizerData] = useState(null);
  const [activeTab, setActiveTab] = useState('public');
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pastCount, setPastCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowersPopup, setShowFollowersPopup] = useState(false);
  const [followers, setFollowers] = useState([]);
  const eventsPerPage = 4;

  useEffect(() => {
    const fetchOrganizerData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/events/search/organizer-infor/${encodeURIComponent(organizerName)}`);
        if (!response.ok) {
          throw new Error(t('profileOrganizer.loadingError'));
        }
        const data = await response.json();
        setOrganizerData(data);
        const upcoming = data.events.filter((event) => event.eventStatus === 'public').length;
        const past = data.events.filter((event) => event.eventStatus === 'Complete').length;
        setUpcomingCount(upcoming);
        setPastCount(past);
        const filteredEvents = data.events.filter(
          (event) => event.eventStatus === (activeTab === 'public' ? 'public' : 'Complete')
        );
        setAllEvents(filteredEvents);
        setDisplayedEvents(filteredEvents.slice(0, eventsPerPage));
        await fetchFollowerCount(data.organizer.organizerId);
        if (user && data.organizer) {
          await checkFollowingStatus(user.userId, data.organizer.organizerId);
        }
      } catch (err) {
        setError(err.message || t('profileOrganizer.loadingError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizerData();
  }, [organizerName, user, t]);

  const fetchFollowerCount = async (organizerId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/follow/followers/count/${organizerId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFollowerCount(response.data.data);
    } catch (err) {
      console.error("Error fetching follower count:", err);
    }
  };

  const checkFollowingStatus = async (userId, organizerId) => {
    if (!user || !token) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/follow/list-org/${user.email}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const following = response.data.some((org) => org.organizerId === organizerId);
      setIsFollowing(following);
    } catch (err) {
      console.error("Error checking following status:", err);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !organizerData?.organizer) return;
    try {
      setIsFollowing((prev) => !prev); // Update state immediately for better UX
      setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1)); // Optimistic update
      if (isFollowing) {
        await axios.delete(`http://localhost:8080/api/follow/${user.userId}/unfollow/${organizerData.organizer.organizerId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post(`http://localhost:8080/api/follow/${user.userId}/follow/${organizerData.organizer.organizerId}`, {}, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      setIsFollowing((prev) => !prev); // Revert state on error
      setFollowerCount((prev) => (isFollowing ? prev + 1 : prev - 1)); // Revert count
      setError(t('profileOrganizer.followError'));
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/follow/followers/details/${organizerData.organizer.organizerId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFollowers(response.data.data.followers);
      setShowFollowersPopup(true);
    } catch (err) {
      console.error("Error fetching followers:", err);
      setError(t('profileOrganizer.followersError'));
    }
  };

  useEffect(() => {
    if (!organizerData) return;
    const filteredEvents = organizerData.events.filter(
      (event) => event.eventStatus === (activeTab === 'public' ? 'public' : 'Complete')
    );
    setAllEvents(filteredEvents);
    setDisplayedEvents(filteredEvents.slice(0, eventsPerPage));
    setPage(1);
  }, [activeTab, organizerData]);

  const handleViewMore = () => {
    if (displayedEvents.length >= allEvents.length) return;

    setIsLoading(true);
    setTimeout(() => {
      const startIndex = page * eventsPerPage;
      const endIndex = startIndex + eventsPerPage;
      const newEvents = allEvents.slice(startIndex, endIndex);
      setDisplayedEvents((prevEvents) => [...prevEvents, ...newEvents]);
      setPage((prevPage) => prevPage + 1);
      setIsLoading(false);
    }, 400);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(
      t('i18nextLng') === 'vi' ? 'vi-VN' : 'en-US',
      {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: t('i18nextLng') === 'en'
      }
    );
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

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (isLoading && displayedEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-t-4 border-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-500 bg-gray-50">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-gray-50">
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 relative overflow-hidden w-[800px] h-[600px] mx-auto grid">
          {organizerData?.organizer?.organizerLogo && (
            <div
              className="absolute inset-0 scale-110 bg-center bg-cover blur-lg opacity-80"
              style={{ backgroundImage: `url(${organizerData.organizer.organizerLogo})` }}
            ></div>
          )}
          <div className="relative flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg w-[500px] h-[450px] mx-auto my-auto">
            {organizerData?.organizer?.organizerLogo ? (
              <img
                src={organizerData.organizer.organizerLogo}
                alt={t('profileOrganizer.noLogo')}
                className="w-[200px] h-[200px] rounded-full object-cover border-4 border-purple-100 shadow-md"
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 bg-gray-200 border-4 border-purple-100 rounded-full shadow-md">
                <span className="text-lg font-medium text-gray-500">{t('profileOrganizer.noLogo')}</span>
              </div>
            )}
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="mb-2 text-3xl font-bold text-purple-800">
                {organizerData?.organizer?.organizerName || t('profileOrganizer.defaultOrganizerName')}
              </h1>
              <div className="mb-2 text-sm text-center text-gray-600">
                {organizerData?.organizer?.organizerDesc || ''}
              </div>
              <div className="flex justify-center gap-2 text-sm text-gray-500">
                <span>{t('profileOrganizer.eventsCount', { count: organizerData?.events?.length || 0 })}</span>
                <span
                  className="cursor-pointer hover:text-purple-600"
                  onClick={fetchFollowers}
                >
                  {t('profileOrganizer.followersCount', { count: followerCount })}
                </span>
              </div>
              <div className="flex justify-center gap-2 mt-2">
                {user && (
                  <button
                    onClick={handleFollowToggle}
                    className={`px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 text-sm ${
                      isFollowing
                        ? 'bg-gray-400 text-white hover:bg-gray-500'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                    disabled={!organizerData?.organizer}
                  >
                    {isFollowing ? t('profileOrganizer.unfollow') : t('profileOrganizer.follow')}
                  </button>
                )}
                {organizerData?.organizer?.organizerWebsite && (
                  <a
                    href={organizerData.organizer.organizerWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800"
                    aria-label={t('profileOrganizer.visitWebsite')}
                  >
                    <i className="fa-solid fa-link"></i>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {showFollowersPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 bg-black bg-opacity-70">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {t('profileOrganizer.followersPopupTitle', { count: followerCount })}
                </h2>
                <button
                  onClick={() => setShowFollowersPopup(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={t('profileOrganizer.close')}
                >
                  <i className="text-lg fa-solid fa-times"></i>
                </button>
              </div>
              {followers.length > 0 ? (
                <ul className="space-y-4">
                  {followers.map((follower) => (
                    <li key={follower.userId} className="flex items-center gap-3">
                      <img
                        src="https://i.pinimg.com/736x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"
                        alt={follower.fullName}
                        className="object-cover w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-700">{follower.fullName}</p>
                        <p className="text-sm text-gray-500">{follower.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">{t('profileOrganizer.noFollowers')}</p>
              )}
            </div>
          </div>
        )}

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-4">
            {['public', 'Complete'].map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                } py-2 px-4 font-medium text-sm transition-colors`}
                onClick={() => setActiveTab(tab)}
                aria-selected={activeTab === tab}
              >
                {tab === 'public'
                  ? t('profileOrganizer.upcomingTab', { count: upcomingCount })
                  : t('profileOrganizer.pastTab', { count: pastCount })}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedEvents.length > 0 ? (
            displayedEvents.map((event) => (
              <div
                key={event.eventId}
                className="max-w-[300px] min-h-[400px] bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 cursor-pointer transition-shadow"
              >
                <div className="relative w-full h-40 overflow-hidden bg-gray-100 rounded-t-lg">
                  {event.eventImages?.[0] ? (
                    <div
                      className="relative w-full h-full bg-center bg-cover"
                      style={{ backgroundImage: `url(${event.eventImages[0]})` }}
                    >
                      <FavoriteButton eventId={event.eventId} />
                    </div>
                  ) : (
                    <img
                      src="https://via.placeholder.com/300x150"
                      alt="Default Event"
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {truncateText(event.eventName, 25) || t('profileOrganizer.eventNamePlaceholder')}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 truncate">
                    {event?.eventDesc ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: sanitizeAndTruncate(event.eventDesc, 30)
                        }}
                      />
                    ) : (
                      t('profileOrganizer.noDescription')
                    )}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">{t('profileOrganizer.dateLabel')}</span>{" "}
                    {new Date(event.eventStart).toLocaleDateString(
                      t('i18nextLng') === 'vi' ? 'vi-VN' : 'en-US'
                    )}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{t('profileOrganizer.timeLabel')}</span>{" "}
                    {new Date(event.eventStart).toLocaleTimeString(
                      t('i18nextLng') === 'vi' ? 'vi-VN' : 'en-US',
                      { hour: "2-digit", minute: "2-digit", hour12: t('i18nextLng') === 'en' }
                    )}{" "}
                    -{" "}
                    {new Date(event.eventEnd).toLocaleTimeString(
                      t('i18nextLng') === 'vi' ? 'vi-VN' : 'en-US',
                      { hour: "2-digit", minute: "2-digit", hour12: t('i18nextLng') === 'en' }
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-700 truncate">
                    <span className="font-medium">{t('profileOrganizer.locationLabel')}</span>{" "}
                    {truncateText(event.eventLocation?.city || t('profileOrganizer.locationPlaceholder'), 25)}
                  </p>
                </div>
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
                    <span className="text-xs text-gray-600">{t('profileOrganizer.noTags')}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500 col-span-full">
              {activeTab === 'public'
                ? t('profileOrganizer.noUpcomingEvents')
                : t('profileOrganizer.noPastEvents')}
            </div>
          )}
        </div>

        {displayedEvents.length < allEvents.length && (
          <div className="flex justify-center mt-6">
            {isLoading ? (
              <div className="w-12 h-12 border-t-4 border-purple-600 rounded-full animate-spin"></div>
            ) : (
              <button
                onClick={handleViewMore}
                className="px-12 py-4 text-[#6F8579] rounded-[4px] hover:bg-gray-100 transition-colors border border-[#C2C4D0]"
              >
                {t('profileOrganizer.viewMore')}
                <i className="ml-2 fa-solid fa-circle-chevron-down"></i>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileOrganizer;