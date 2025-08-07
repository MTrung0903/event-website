import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { useTranslation } from "react-i18next";
import Loader from "../../components/Loading";
const Calendar = () => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [notes, setNotes] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { user } = useAuth();

  const colorPalette = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD", "#D4A5A5", "#9B59B6"
  ];

  const getRandomColor = () => {
    return colorPalette[Math.floor(Math.random() * colorPalette.length)];
  };

  const eventsWithColors = events.map((event) => ({
    ...event,
    color: getRandomColor(),
  }));

  useEffect(() => {
    fetchAllEvents();
    generateCalendar();
  }, []);

  const handleViewDetail = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const fetchAllEvents = async () => {
    if (!token) {
      setError(t('calendar.error', { message: "No authentication token found" }));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/role-assignment/${user.userId}/get-events`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(t('calendar.error', { message: "Failed to fetch events" }));
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      setError(t('calendar.error', { message: error.message }));
      console.error(t('calendar.error', { message: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const nextMonthDays = 35 - (firstDay + totalDays);

    let days = [];
    for (let i = firstDay; i > 0; i--) {
      days.push({ day: prevMonthDays - i + 1, isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    setDaysInMonth(days);
  };

  const changeMonth = (offset) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  const today = new Date();
  const isToday = (day) => {
    return (
      day.isCurrentMonth &&
      today.getDate() === day.day &&
      today.getMonth() === currentMonth.getMonth()
    );
  };

  const openNotePopup = (day) => {
    if (!day.isCurrentMonth) return;
    setSelectedDay(day.day);
    setNoteText(notes[day.day] || "");
    setShowPopup(true);
  };

  const saveNote = () => {
    setNotes({ ...notes, [selectedDay]: noteText });
    setShowPopup(false);
  };

  const openCreateEventDialog = (day) => {
    if (!day.isCurrentMonth) return;
    setSelectedDay(day.day);
    setShowCreateEventDialog(true);
  };

  const handleCreateEvent = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const day = selectedDay;
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    localStorage.setItem("dateBegin", formattedDate);
    setShowCreateEventDialog(false);
    navigate("/createEvent");
  };

  const closeCreateEventDialog = () => {
    setShowCreateEventDialog(false);
    setSelectedDay(null);
  };

  const getEventsForDay = (day) => {
    if (!day.isCurrentMonth) return [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.day
      .toString()
      .padStart(2, "0")}`;
    return eventsWithColors.filter((event) => {
      const eventDate = new Date(event.eventStart).toISOString().split("T")[0];
      return eventDate === dateStr;
    });
  };

  // Map month number (0-11) to translation key
  const monthKeys = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const currentMonthName = t(`calendar.months.${monthKeys[currentMonth.getMonth()]}`);
  const currentYear = currentMonth.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 py-4 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[6px] shadow p-6 max-w-7xl mx-auto">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
              <Loader />
            </div>
          )}
          {error && (
            <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
          {!isLoading && !error && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-t-xl border-b border-gray-300">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 text-teal-600 hover:bg-teal-100 rounded-full transition-colors duration-300"
                  aria-label={t('calendar.previousMonth')}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-2xl font-bold text-gray-800">
                  {`${currentMonthName} ${currentYear}`}
                </span>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 text-teal-600 hover:bg-teal-100 rounded-full transition-colors duration-300"
                  aria-label={t('calendar.nextMonth')}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendar */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => (
                  <div
                    key={day}
                    className="bg-gray-50 text-center py-3 text-sm font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    {t(`calendar.weekdays.${day}`)}
                  </div>
                ))}
                {daysInMonth.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => openCreateEventDialog(day)}
                    className={`relative bg-white p-3 min-h-[120px] flex flex-col justify-start text-center cursor-pointer transition-all duration-300 hover:bg-teal-50
                      ${day.isCurrentMonth ? "text-gray-800" : "text-gray-400"}
                      ${isToday(day) ? "border-2 border-teal-500 rounded-lg" : ""}`}
                    aria-label={t('calendar.day', { day: day.day })}
                  >
                    <span className={`text-sm font-medium ${isToday(day) ? "text-teal-600" : ""}`}>
                      {day.day}
                    </span>
                    <div className="mt-2 space-y-1 overflow-y-auto max-h-20 scrollbar-thin scrollbar-thumb-teal-300">
                      {getEventsForDay(day).map((event) => (
                        <div
                          key={event.eventId}
                          className="text-xs px-2 py-1 text-white rounded truncate hover:scale-105 transition-transform"
                          style={{ backgroundColor: event.color }}
                          title={event.eventName}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(event.eventId);
                          }}
                        >
                          {event.eventName}
                        </div>
                      ))}
                    </div>
                    {notes[day.day] && (
                      <span className="text-xs px-2 py-1 mt-2 bg-orange-500 text-white rounded truncate">
                        {notes[day.day]}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Popup for Notes */}
              {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 transition-opacity duration-300">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {t('calendar.noteTitle', { day: selectedDay })}
                    </h3>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows="4"
                      aria-label={t('calendar.noteInput')}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setShowPopup(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        aria-label={t('calendar.cancel')}
                      >
                        {t('calendar.cancel')}
                      </button>
                      <button
                        onClick={saveNote}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        aria-label={t('calendar.save')}
                      >
                        {t('calendar.save')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dialog for Create Event */}
              {showCreateEventDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 transition-opacity duration-300">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 scale-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {t('calendar.createEventTitle')}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {t('calendar.selectedDate', {
                        day: selectedDay,
                        month: currentMonth.getMonth() + 1,
                        year: currentMonth.getFullYear()
                      })}
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={closeCreateEventDialog}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        aria-label={t('calendar.no')}
                      >
                        {t('calendar.no')}
                      </button>
                      <button
                        onClick={handleCreateEvent}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        aria-label={t('calendar.yes')}
                      >
                        {t('calendar.yes')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;