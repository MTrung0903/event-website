import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loader from "../../components/Loading";
import Footer from "../../components/Footer";
import DOMPurify from "dompurify";
import { CiCalendarDate, CiTimer, CiLocationOn } from "react-icons/ci";
import { FaEye } from "react-icons/fa6";

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const SearchByType = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const categoryName = location.state?.categoryName || "";
  const [events, setEvents] = useState(location.state?.events || []);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const eventsPerPage = 4;

  const wallper = [
    {
      id: 1,
      type: "music",
      wallper:
        "https://i.pinimg.com/736x/16/91/f8/1691f8d6bea96494d2cf50994b530a3a.jpg",
      backgroundColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
      textColor: "text-yellow-200"
    },
    {
      id: 2,
      type: "nightlife",
      wallper:
        "https://i.pinimg.com/736x/d4/87/40/d4874012f8576f9b791082c343e0e6b8.jpg",
      backgroundColor: "bg-gradient-to-r from-purple-600 to-pink-500",
      textColor: "text-white"
    },
    {
      id: 3,
      type: "performing",
      wallper:
        "https://i.pinimg.com/736x/ad/27/ef/ad27ef55839b1d23659869719d7d246b.jpg",
      backgroundColor: "bg-red-700",
      textColor: "text-amber-200"
    },
    {
      id: 4,
      type: "holidays",
      wallper:
        "https://i.pinimg.com/736x/1d/82/aa/1d82aa438152e8cc1918b2c99a4dc845.jpg",
      backgroundColor: "bg-gradient-to-r from-[#E8D5A2] to-[#E6B680]",
      textColor: "text-[#28504E]"
    },
    {
      id: 5,
      type: "dating",
      wallper:
        "https://i.pinimg.com/736x/fd/bf/35/fdbf357c58c396eea58d49fe63520aad.jpg",
      backgroundColor: "bg-rose-400",
      textColor: "text-white"
    },
    {
      id: 6,
      type: "hobbies",
      wallper:
        "https://i.pinimg.com/736x/62/d0/4e/62d04e9b4ba60658c31775b718f87999.jpg",
      backgroundColor: "bg-teal-400",
      textColor: "text-gray-800"
    },
    {
      id: 7,
      type: "business",
      wallper:
        "https://i.pinimg.com/736x/08/42/0a/08420a20017446fdda37f5d3f132dc88.jpg",
      backgroundColor: "bg-blue-800",
      textColor: "text-gray-100"
    },
    {
      id: 8,
      type: "foodAndDrink",
      wallper:
        "https://i.pinimg.com/736x/72/2c/8f/722c8fc121b89f7fb1669c36ffbb09a1.jpg",
      backgroundColor: "bg-gradient-to-r from-orange-400 to-red-400",
      textColor: "text-white"
    },
    {
      id: 9,
      type: "conference",
      wallper:
        "https://i.pinimg.com/736x/c8/57/93/c85793cc309c0b82e20138f47625b803.jpg",
      backgroundColor: "bg-gradient-to-r from-[#28504E] to-[#1E1C38]",
      textColor: "text-cyan-200"
    },
    {
      id: 10,
      type: "default",
      wallper:
        "https://i.pinimg.com/736x/3f/ae/d1/3faed1e0c25ddee73c9bd8579d76b0e9.jpg",
      backgroundColor: "bg-gradient-to-r from-[#28504E] to-[#1E1C38]",
      textColor: "text-cyan-200"
    }
  ];

  const sanitizeAndTruncate = (html, maxLength) => {
    const sanitizedHtml = DOMPurify.sanitize(html || "");
    const plainText = sanitizedHtml.replace(/<[^>]+>/g, "");
    if (plainText.length <= maxLength) {
      return sanitizedHtml;
    }
    const truncatedPlainText = truncateText(plainText, maxLength);
    return `<p>${truncatedPlainText}</p>`;
  };

  const selectedCategory = wallper.find(
    (item) => item.type.toLowerCase() === categoryName.toLowerCase()
  ) || wallper.find((item) => item.id === 10);

  useEffect(() => {
    if (events && events.length > 0) {
      const initialEvents = events.slice(0, eventsPerPage * 2);
      setDisplayedEvents(initialEvents);
      setPage(3);
    } else {
      setDisplayedEvents([]);
      setPage(1);
    }
    window.scrollTo(0, 0);
  }, [events]);

  const handleViewMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      const startIndex = displayedEvents.length;
      const endIndex = startIndex + eventsPerPage;
      const newEvents = events.slice(startIndex, endIndex);
      setDisplayedEvents((prev) => [...prev, ...newEvents]);
      setPage((prevPage) => prevPage + 1);
      setIsLoading(false);
    }, 500);
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const getLocation = (location) => {
    if (!location || (!location.venueName && !location.address && !location.city)) {
      return t('searchByType.online');
    }
    const parts = [location.venueName, location.address, location.city].filter(
      (part) => part && part.trim() !== ""
    );
    return parts.length > 0 ? parts.join(", ") : t('searchByType.online');
  };

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 250);
  }, []);

  return loading ? (
    <div className="flex items-center justify-center h-screen">
      <Loader />
    </div>
  ) : (
    <>
      <div
        className={`w-full h-[290px] ${selectedCategory.backgroundColor} grid grid-cols-2 my-6 gap-6 place-items-center`}
      >
        <div
          className={`${selectedCategory.textColor} font-weight-800 flex flex-col items-start justify-center`}
        >
          <h1 className="font-mono text-5xl font-extrabold text-center">
            {(categoryName
              ? t(`searchByType.eventTypes.${selectedCategory.type}`)
              : t('searchByType.popularEvents')
            ).toUpperCase()}
          </h1>
          <p className="mt-2 text-lg text-center">
            {t(`searchByType.slogans.${selectedCategory.type}`)}
          </p>
        </div>
        <img
          src={selectedCategory.wallper}
          className="w-[480px] h-[290px] object-cover"
          alt={categoryName ? t(`searchByType.eventTypes.${selectedCategory.type}`) : t('searchByType.upcomingEvents')}
        />
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-8 py-4 relative">
        <h2 className="mb-4 text-2xl font-bold text-gray-800 font-lato">
          {(categoryName
            ? `${t('searchByType.popularEvents')} ${t(`searchByType.eventTypes.${selectedCategory.type}`)}`
            : t('searchByType.upcomingEvents')
          ).toUpperCase()}
        </h2>

        {events.length === 0 ? (
          <p className="text-gray-600">{t('searchByType.noEventsFound')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {displayedEvents.map((event) => (
                <div
                  key={event.eventId}
                  onClick={() => handleEventClick(event.eventId)}
                  className="max-w-[300px] min-h-[400px] bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 cursor-pointer transition-shadow"
                >
                  <div className="w-full h-40 overflow-hidden bg-gray-100 rounded-t-lg">
                    {event.eventImages && event.eventImages.length > 0 ? (
                      <img
                        src={event.eventImages[0]}
                        alt={event.eventName}
                        className="object-cover w-full h-full"
                      />
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
                      {truncateText(event.eventName, 25) || t('searchByType.unnamedEvent')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 truncate">
                      {event?.eventDesc ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: sanitizeAndTruncate(event.eventDesc, 30)
                          }}
                        />
                      ) : (
                        t('searchByType.noDescription')
                      )}
                    </p>
                     <p className="mt-1 text-xs text-gray-700 sm:text-sm sm:mt-2">
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
                      <span className="text-xs text-gray-600">{t('searchByType.noTags')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {displayedEvents.length < events.length && (
              <div className="flex justify-center mt-6">
                {isLoading ? (
                  <Loader />
                ) : (
                  <button
                    onClick={handleViewMore}
                    className="px-6 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    {t('searchByType.viewMore')}
                  </button>
                )}
              </div>
            )}
          </>
        )}
        <Footer />
      </div>
    </>
  );
};

export default SearchByType;