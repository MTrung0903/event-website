import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import EditProfile from "./EditProfile";
import { useAuth } from "../Auth/AuthProvider";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const ViewProfile = () => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersPopup, setShowFollowersPopup] = useState(false);
  const [showFollowingPopup, setShowFollowingPopup] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [followingOrganizers, setFollowingOrganizers] = useState([]);
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/auth/user/${user.email}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
      if (response.data.organizer) {
        fetchFollowerCount(response.data.organizer.organizerId);
      } else {
        setFollowerCount(0);
      }
      fetchFollowingCount(user.email);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(t('viewProfile.loadingError'));
      setLoading(false);
    }
  };

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
      setFollowerCount(0);
    }
  };

  const fetchFollowingCount = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/follow/following/count/${email}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFollowingCount(response.data.data);
    } catch (err) {
      console.error("Error fetching following count:", err);
      setFollowingCount(0);
    }
  };

  const fetchFollowers = async (organizerId) => {
    if (!organizerId) {
      setFollowers([]);
      setShowFollowersPopup(true);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/api/follow/followers/${organizerId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFollowers(response.data);
      setShowFollowersPopup(true);
    } catch (err) {
      console.error("Error fetching followers:", err);
      setError(t('viewProfile.followersError'));
    }
  };

  const fetchFollowingOrganizers = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/follow/list-org/${email}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFollowingOrganizers(response.data);
      setShowFollowingPopup(true);
    } catch (err) {
      console.error("Error fetching following organizers:", err);
      setError(t('viewProfile.followingError'));
    }
  };

  useEffect(() => {
    fetchUserData();
    window.scrollTo(0, 0);
  }, []);

  const handleEditClick = () => {
    setOpenEdit(true);
  };

  const closeEdit = () => {
    setOpenEdit(false);
    fetchUserData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
        <div className="text-lg font-bold text-teal-600 sm:text-xl md:text-2xl animate-pulse">{t('viewProfile.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
        <div className="text-sm sm:text-base md:text-lg font-semibold text-red-500 bg-white p-3 sm:p-4 rounded-lg shadow-lg max-w-[90%] text-center">
          {error}
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return t('viewProfile.notUpdated');
    const date = new Date(dateString);
    return date.toLocaleDateString(
      t('i18nextLng') === 'vi' ? 'vi-VN' : 'en-US',
      {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
      }
    );
  };

  const [firstName, ...lastNameParts] = userData.fullName.split(" ");
  const lastName = lastNameParts.join(" ") || t('viewProfile.notUpdated');

  const isAttendeeOnly = user?.primaryRoles?.includes("ATTENDEE") && !user?.primaryRoles?.includes("ORGANIZER");

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-teal-50 to-gray-100">
      {isAttendeeOnly && <Header />}
      <div className={`py-4 sm:py-6 ${isAttendeeOnly ? 'mt-28' : ''}`}>
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex flex-col items-stretch gap-4 lg:flex-row sm:gap-6 lg:gap-8">
            <div className="flex w-full lg:w-1/3">
              <div className="flex-1 p-6 transition-all transform bg-white border-t-4 border-teal-500 shadow-lg rounded-xl sm:rounded-2xl sm:shadow-xl sm:p-8 hover:shadow-2xl hover:-translate-y-1">
                <div className="relative flex justify-center">
                  <img
                    className="object-cover w-24 h-24 transition-transform transform border-4 border-teal-100 rounded-full shadow-md sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 hover:scale-105"
                    src={userData.organizer?.organizerLogo || "https://i.pinimg.com/736x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"}
                    alt={t('viewProfile.profileAlt')}
                  />
                  <div className="absolute inset-0 bg-teal-500 rounded-full opacity-10 blur-xl"></div>
                </div>
                <h1 className="mt-4 text-xl font-extrabold tracking-tight text-center text-gray-800 sm:text-2xl md:text-3xl sm:mt-6">
                  {userData.fullName}
                </h1>
                <h3 className="mt-2 text-sm font-semibold text-center text-gray-600 sm:text-base md:text-lg">
                  {userData.roles?.[0]?.name || "User"}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-center text-gray-500 sm:text-sm sm:mt-3">
                  {userData.organizer?.organizerName || t('viewProfile.notAnOrganizer')}
                </p>
                <div className="p-4 mt-6 rounded-lg shadow-inner sm:mt-8 bg-gray-50 sm:rounded-xl sm:p-6">
                  <ul className="space-y-3 text-xs text-gray-600 sm:space-y-4 sm:text-sm">
                    <li className="flex items-center justify-between">
                      <span className="font-medium">{t('viewProfile.status')}</span>
                      <span
                        className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow ${
                          userData.active ? "bg-teal-500 text-white" : "bg-red-500 text-white"
                        }`}
                      >
                        {userData.active ? t('viewProfile.active') : t('viewProfile.inactive')}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-medium">{t('viewProfile.followersPopupTitle')}</span>
                      <span
                        className="text-gray-700 cursor-pointer hover:text-teal-600"
                        onClick={() => fetchFollowers(userData.organizer?.organizerId)}
                      >
                        {t('viewProfile.followers', { count: followerCount })}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-medium">{t('viewProfile.followingPopupTitle')}</span>
                      <span
                        className="text-gray-700 cursor-pointer hover:text-teal-600"
                        onClick={() => fetchFollowingOrganizers(user.email)}
                      >
                        {t('viewProfile.following', { count: followingCount })}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex w-full lg:w-2/3">
              <div className="flex-1 p-6 bg-white shadow-lg rounded-xl sm:rounded-2xl sm:shadow-xl sm:p-8">
                <div className="flex flex-col items-start justify-between mb-6 sm:flex-row sm:items-center sm:mb-8">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <svg
                      className="w-6 h-6 text-teal-500 sm:h-7 sm:w-7"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-lg font-bold tracking-tight text-gray-800 sm:text-xl md:text-2xl">
                      {t('viewProfile.personalInfo')}
                    </span>
                  </div>
                  <button
                    onClick={handleEditClick}
                    className="mt-3 sm:mt-0 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:-translate-y-0.5 text-sm sm:text-base"
                  >
                    <i className="mr-1 fa-solid fa-user-pen sm:mr-2"></i>{t('viewProfile.edit')}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 pb-6 text-gray-700 border-b-2 border-gray-100 sm:grid-cols-2 sm:gap-6 sm:pb-8">
                  {[
                    { label: t('viewProfile.firstName'), value: firstName },
                    { label: t('viewProfile.lastName'), value: lastName },
                    { label: t('viewProfile.gender'), value: userData.gender || t('viewProfile.notUpdated') },
                    { label: t('viewProfile.birthday'), value: formatDate(userData.birthday) },
                    { label: t('viewProfile.address'), value: userData.address || t('viewProfile.notUpdated') },
                    {
                      label: t('viewProfile.email'),
                      value: (
                        <a
                          href={`mailto:${userData.email}`}
                          className="text-teal-600 transition-colors hover:text-teal-800"
                        >
                          {userData.email}
                        </a>
                      )
                    }
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-1 group">
                      <div className="text-sm font-semibold text-gray-600 transition-colors group-hover:text-teal-600 sm:text-base">
                        {item.label}
                      </div>
                      <div className="overflow-hidden text-sm text-gray-700 transition-colors group-hover:text-gray-900 sm:text-base text-ellipsis whitespace-nowrap hover:whitespace-normal hover:overflow-visible">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
                {userData.organizer && (
                  <div className="mt-6 sm:mt-8">
                    <div className="flex items-center mb-4 space-x-2 sm:space-x-3 sm:mb-6">
                      <i className="text-lg text-teal-600 fa-solid fa-users sm:text-xl"></i>
                      <span className="text-lg font-bold tracking-tight text-gray-800 sm:text-xl md:text-2xl">
                        {t('viewProfile.organizationalInfo')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 text-gray-700 sm:grid-cols-2 sm:gap-6">
                      {[
                        { label: t('viewProfile.organizationName'), value: userData.organizer.organizerName },
                        { label: t('viewProfile.address'), value: userData.organizer.organizerAddress },
                        {
                          label: t('viewProfile.website'),
                          value: (
                            <a
                              href={userData.organizer.organizerWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-600 transition-colors hover:text-teal-800"
                            >
                              {userData.organizer.organizerWebsite}
                            </a>
                          )
                        },
                        { label: t('viewProfile.phoneNumber'), value: userData.organizer.organizerPhone },
                        { label: t('viewProfile.description'), value: userData.organizer.organizerDesc }
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col gap-1 group">
                          <div className="text-sm font-semibold text-gray-600 transition-colors group-hover:text-teal-600 sm:text-base">
                            {item.label}
                          </div>
                          <div className="overflow-hidden text-sm text-gray-700 transition-colors group-hover:text-gray-900 sm:text-base text-ellipsis whitespace-nowrap hover:whitespace-normal hover:overflow-visible">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                  {t('viewProfile.followersPopupTitle', { count: followerCount })}
                </h2>
                <button
                  onClick={() => setShowFollowersPopup(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={t('viewProfile.close')}
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
                <p className="text-center text-gray-500">
                  {userData.organizer ? t('viewProfile.noFollowers') : t('viewProfile.noFollowersNonOrganizer')}
                </p>
              )}
            </div>
          </div>
        )}

        {showFollowingPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 bg-black bg-opacity-70">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {t('viewProfile.followingPopupTitle', { count: followingCount })}
                </h2>
                <button
                  onClick={() => setShowFollowingPopup(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={t('viewProfile.close')}
                >
                  <i className="text-lg fa-solid fa-times"></i>
                </button>
              </div>
              {followingOrganizers.length > 0 ? (
                <ul className="space-y-4">
                  {followingOrganizers.map((organizer) => (
                    <li key={organizer.organizerId} className="flex items-center gap-3">
                      <img
                        src={organizer.organizerLogo || "https://i.pinimg.com/736x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"}
                        alt={organizer.organizerName}
                        className="object-cover w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-700">{organizer.organizerName}</p>
                        <p className="text-sm text-gray-500">
                          {organizer.organizerDesc || t('viewProfile.noDescription')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">{t('viewProfile.noFollowing')}</p>
              )}
            </div>
          </div>
        )}

        {openEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 bg-black bg-opacity-70">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-[95%] sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto transform transition-all duration-500 scale-100 opacity-100 animate-fadeIn">
              <EditProfile onClose={closeEdit} userData={userData} />
            </div>
          </div>
        )}
      </div>
      {isAttendeeOnly && <Footer />}
    </div>
  );
};

export default ViewProfile;