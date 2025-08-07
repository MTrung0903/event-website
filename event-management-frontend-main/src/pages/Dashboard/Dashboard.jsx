import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch, FaEllipsisV, FaFileCsv } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loading";
import { useAuth } from "../Auth/AuthProvider";
import Swal from 'sweetalert2';
const EventsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Events");
  const [filterStatus, setFilterStatus] = useState("");
  const [events, setEvents] = useState([]);
  const [popupVisible, setPopupVisible] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 4;
  const token = localStorage.getItem("token");
  const popupRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const handleTabClick = (tab) => setActiveTab(tab);
  const togglePopup = (id) => setPopupVisible(popupVisible === id ? null : id);

  useEffect(() => {
    if (user?.email && token) {
      fetchEventData();
      window.scrollTo(0, 0);
    }
  }, [user?.email, token]);

  const fetchEventData = async () => {
    setLoading(true);
    try {
      console.log("Fetching events for email:", user.email);
      console.log("Using token:", token);
      const response = await fetch(
        `http://localhost:8080/api/events/get-all-event-by-org/${user.email}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API response (get-all-event-by-org):", data);
      setEvents(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('dashboard.errorLoadEventsTitle'),
        text: t('dashboard.errorLoadEventsText'),
      });
    } finally {
      setLoading(false);
    }
  };
  const actionOptions = [
    { key: 'viewDetails', label: t('dashboard.viewEventDetails') },
    { key: 'deleteEvent', label: t('dashboard.deleteEvent') },
    { key: 'publishEvent', label: t('dashboard.publishEvent') },
  ];
  const deleteEvent = async (eventId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/events/delete/${eventId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "DELETE"
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      Swal.fire({
        title: `${data.msg}`,
        text: `${data.data}`,
      });
      if (data.statusCode === 200) {
        await fetchEventData();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      Swal.fire({
        icon: 'error',
        title: t('dashboard.errorDeleteEventTitle'),
        text: t('dashboard.errorDeleteEventText'),
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByStatus = (events, status) => {
    if (!status) {
      return events;
    }
    return events.filter(
      (event) =>
        event.eventStatus &&
        event.eventStatus.toLowerCase() === status.toLowerCase()
    );
  };

  const searchEventsByName = (events, searchTerm) => {
    if (!searchTerm.trim()) {
      return events;
    }
    return events.filter(
      (event) =>
        event.eventName &&
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleActionClick = (action, eventId) => {
    if (action === "viewDetails") {
      navigate(`/dashboard/event/detail/${eventId}`, { state: { eventId } });
    } else if (action === "deleteEvent") {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This event will be deleted and cannot be recovered!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          deleteEvent(eventId);
          Swal.fire(
            'Deleted!',
            'The event has been deleted successfully.',
            'success'
          );
        }
      });
    } else if (action === "publishEvent") {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This event will be published and visible to the public!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, publish it!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          publishEvent(eventId);
          Swal.fire(
            'Published!',
            'The event has been published successfully.',
            'success'
          );
        }
      });
    }
    setPopupVisible(null);
  };
  const publishEvent = async (eventId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/events/publish/${eventId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      Swal.fire({
        title: `${data.msg}`,
        text: "Sự kiện xuất bản thành công",
      });
      if (data.statusCode === 200) {
        await fetchEventData();
      }
    } catch (error) {
      console.error("Error publishing event:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to publish event',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSearchClick = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupVisible(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchedEvents = searchEventsByName(events, searchTerm);
  const filteredEvents = filterEventsByStatus(searchedEvents, filterStatus);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return loading ? (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
      <div className="w-12 h-12 border-t-4 border-teal-500 rounded-full animate-spin sm:h-16 sm:w-16"></div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 py-6 sm:py-8 md:py-12 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-6 sm:mb-8">
          {t('dashboard.title')}
        </h1>

        <div className="flex flex-col items-start justify-between mb-6 space-y-4 sm:flex-row sm:items-center sm:mb-8 sm:space-y-0 sm:space-x-4">
          <div className="relative flex flex-col items-center w-full space-y-3 sm:w-auto sm:flex-row sm:space-y-0 sm:space-x-3">
            <input
              type="text"
              placeholder={t('dashboard.searchPlaceholder')}
              className="w-full sm:w-80 md:w-96 bg-white border border-gray-200 rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-sm shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleSearchClick}
              className="bg-teal-500 text-white p-2 sm:p-3 rounded-lg shadow-md hover:bg-teal-600 transition-colors duration-300"
              aria-label={t('dashboard.searchButton')}
            >
              <FaSearch className="text-sm sm:text-base" />
            </button>
          </div>
          <div className="flex flex-col w-full space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:w-auto">
            <select
              className="px-3 py-2 text-sm text-white transition-colors duration-300 bg-teal-500 rounded-lg shadow-sm sm:py-3 sm:px-4 hover:bg-teal-600"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">{t('dashboard.filterAll')}</option>
              <option value="public">{t('dashboard.filterPublic')}</option>
              <option value="Draft">{t('dashboard.filterDraft')}</option>
              <option value="Complete">{t('dashboard.filterComplete')}</option>
            </select>
            <button
              className="px-3 py-2 text-sm text-white transition-colors duration-300 bg-orange-500 rounded-lg shadow-sm sm:py-3 sm:px-4 hover:bg-orange-600"
              onClick={() => navigate("/createEvent")}
            >
              {t('dashboard.createEvent')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-12 gap-2 sm:gap-4 p-4 sm:p-6 bg-gray-50 border-b border-gray-200 text-xs sm:text-sm font-semibold text-gray-600">
            <div className="col-span-5">{t('dashboard.tableEvents')}</div>
            <div className="col-span-2"></div>
            <div className="col-span-2"></div>
            <div className="col-span-2">{t('dashboard.tableStatus')}</div>
            <div className="col-span-1"></div>
          </div>
          {currentEvents.length === 0 ? (
            <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
              {t('dashboard.notFound')}
            </div>
          ) : (
            currentEvents.map((event) => (
              <div
                key={event.eventId}
                className="grid grid-cols-1 gap-2 p-3 transition-colors duration-300 border-b border-gray-200 sm:grid-cols-12 sm:gap-4 sm:p-4 md:p-6 hover:bg-teal-50"
              >
                <div className="flex items-center col-span-1 space-x-3 sm:col-span-5 sm:space-x-4">
                  {event.eventImages && event.eventImages.length > 0 ? (
                    <img
                      src={event.eventImages[0]}
                      alt={event.eventName}
                      className="object-cover w-12 h-12 rounded-lg shadow-sm sm:w-16 sm:h-16 md:w-20 md:h-20"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-gray-500 text-xs sm:text-sm">{t('dashboard.noImage')}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 truncate sm:text-base">
                      {event.eventName}
                    </h3>
                    <p className="text-xs text-gray-600 truncate sm:text-sm">
                      {event.eventLocation.venueName}
                    </p>
                    <p className="text-xs text-gray-600 sm:text-sm">{event.eventType}</p>
                  </div>
                </div>
                <div className="flex items-center col-span-1 text-xs text-gray-600 sm:col-span-2 sm:text-sm"></div>
                <div className="flex items-center col-span-1 text-xs text-gray-600 sm:col-span-2 sm:text-sm"></div>
                <div className="flex items-center col-span-1 text-xs text-gray-600 sm:col-span-2 sm:text-sm">
                  {event.eventStatus}
                </div>
                <div className="relative flex justify-end col-span-1 sm:col-span-1">
                  <FaEllipsisV
                    className="text-base text-gray-600 transition-colors duration-300 cursor-pointer sm:text-lg hover:text-teal-600"
                    onClick={() => togglePopup(event.eventId)}
                  />
                  {popupVisible === event.eventId && (
                    <div
                      ref={popupRef}
                      className="absolute right-0 z-10 w-40 mt-2 transition-all duration-200 transform bg-white border border-gray-200 rounded-lg shadow-xl sm:w-48"
                    >
                      {actionOptions
                        .filter((option) =>
                          option.key !== 'publishEvent' || (event.eventStatus && event.eventStatus.toLowerCase() === 'draft')
                        )
                        .map((option) => (
                          <div
                            key={option.key}
                            className="px-3 py-2 text-xs text-gray-700 transition-colors duration-200 cursor-pointer sm:px-4 hover:bg-teal-100 hover:text-teal-600 sm:text-sm"
                            onClick={() => handleActionClick(option.key, event.eventId)}
                          >
                            {option.label}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {filteredEvents.length > 0 && (
            <div className="flex flex-col items-center justify-between p-4 border-t border-gray-200 sm:flex-row sm:p-6 bg-gray-50">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors duration-300 ${currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
              >
                {t('dashboard.previous')}
              </button>
              <div className="flex my-2 space-x-1 sm:space-x-2 sm:my-0">
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(
                    Math.max(0, currentPage - 2),
                    Math.min(totalPages, currentPage + 1)
                  )
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-2 sm:px-3  py-1 rounded-lg text-xs sm:text-sm transition-colors duration-300 ${currentPage === page
                          ? "bg-teal-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-teal-100"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors duration-300 ${currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
              >
                {t('dashboard.next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <EventsPage />
    </div>
  );
};

export default Dashboard;