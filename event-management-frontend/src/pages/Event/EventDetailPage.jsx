import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Carousel } from "react-responsive-carousel";
import SliderSpeaker from "../../components/SilderSpeaker";
import Footer from "../../components/Footer";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Checkout from "../Ticket/CheckOut";
import Loader from "../../components/Loading";
import { useParams } from "react-router-dom";
import ListEventScroll from "../../components/EventListScroll";
import DOMPurify from "dompurify";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { User, MessageCircle } from "lucide-react";
import ChatBubble from "../ChatBox/ChatBubble";
import { useAuth } from "../Auth/AuthProvider";
import Swal from "sweetalert2";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import axios from "axios";

// : Format date and time
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    const date = parseISO(isoString);
    return format(date, "MMM d, yyyy 'at' HH:mm");
  } catch {
    return "Invalid date";
  }
};

// : Format time only
const formatTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    const date = parseISO(isoString);
    return format(date, "HH:mm");
  } catch {
    return "Invalid time";
  }
};

// : Calculate new ticket count
const calculateNewCount = (current, delta, max, ticketType) => {
  const updated = current + delta;
  if (updated < 0) return 0;
  if (ticketType === "Free" && updated > 1) return 1;
  if (updated > max) return max;
  return updated;
};

// : Update selected tickets
const updateTickets = (prev, ticketId, newCount) => {
  if (newCount === 0) {
    const { [ticketId]: _, ...rest } = prev;
    return rest;
  }
  return { ...prev, [ticketId]: newCount };
};

// Custom hook for fetching event data
const useEventData = (eventId, userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = userId ? `?userId=${userId}` : '';
        const response = await fetch(
          `http://localhost:8080/api/events/detail/${eventId}${query}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch event data");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to fetch event data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, userId]);

  return { data, loading, error };
};

// Timeline Component
const Timeline = ({ segments, t }) => {
  if (!segments?.length) {
    return (
      <div className="mx-4 my-4 text-sm text-gray-600 sm:my-6 sm:mx-8 lg:mx-16 sm:text-base">
      </div>
    );
  }

  return (
    <div className="my-4 sm:my-6 mx-4 sm:mx-8 lg:mx-16 sm:ml-12 lg:ml-[100px]">
      <h2 className="mb-2 text-lg font-bold text-gray-800 sm:text-xl lg:text-xl">
        {t("eventDetailPage.schedule")}
      </h2>
      {segments.map((segment, index) => (
        <div
          key={segment.segmentId}
          className="relative py-4 pl-4 sm:pl-16 lg:pl-32 sm:py-6 group"
        >
          <time className="relative sm:absolute left-0 sm:-left-12 lg:-left-16 translate-y-0.5 inline-flex items-center text-[10px] sm:text-xs lg:text-sm font-semibold uppercase min-w-max h-5 sm:h-6 lg:h-7 mb-2 sm:mb-0 text-emerald-600 bg-emerald-100 rounded-full whitespace-nowrap px-2 sm:px-3 lg:px-4 py-1 sm:py-1 lg:py-2">
            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
          </time>
          <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-0 sm:before:left-6 lg:before:left-10 before:h-full before:px-px before:bg-slate-300 sm:before:ml-6 lg:before:ml-8 before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-0 sm:after:left-6 lg:after:left-10 after:w-2 after:h-2 after:bg-indigo-600 after:border-4 after:box-content after:border-slate-50 after:rounded-full sm:after:ml-6 lg:after:ml-8 after:-translate-x-1/2 after:translate-y-1.5">
            <div className="text-base font-bold sm:text-lg lg:text-xl text-slate-900">
              {segment.speaker?.speakerName || ""}
            </div>
          </div>
          <p className="text-gray-600 text-[11px] sm:text-sm lg:text-base">
            {segment.speaker?.speakerDesc || ""}
          </p>
          <p className="mt-1 text-sm font-bold text-indigo-700 sm:text-base lg:text-lg">
            "{segment.segmentTitle || t("eventDetailPage.noDescription")}"
          </p>
          <p className="text-gray-600 text-[11px] sm:text-sm lg:text-base">
            "{segment.segmentDesc || t("eventDetailPage.noDescription")}"
          </p>
        </div>
      ))}
    </div>
  );
};

// OrganizedBy Component
const OrganizedBy = ({ organizer, currentUser, hostId, t }) => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatClick = () => {
    if (organizer?.organizerEmail) {
      setIsChatOpen(true);
    }
  };

  const handleOrganizerClick = () => {
    if (organizer?.organizerName) {
      window.open(
        `/profile-organizer/${encodeURIComponent(organizer.organizerName)}`,
        "_blank"
      );
    }
  };

  return (
    <div className="max-w-3xl mt-10 mb-8 font-inter">
      <h2 className="mb-3 text-lg font-semibold text-gray-800 sm:text-xl font-playfair">
        {t("eventDetailPage.organizedBy")}
      </h2>
      <div className="relative p-6 bg-white border border-gray-200 sm:p-8 rounded-2xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 animate-pulse-subtle" />
            <div className="relative flex items-center justify-center w-full h-full bg-white border-2 border-gray-100 rounded-full shadow-sm">
              <img
                src={organizer?.organizerLogo || "https://i.pinimg.com/736x/40/dc/20/40dc204e1681aea04a030aaa6d1aac39.jpg"}
                alt={t("eventDetailPage.organizedBy")}
                className="object-cover w-20 h-20 border-4 border-purple-100 rounded-full shadow-md"
              />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3
              className="mb-3 text-lg font-semibold leading-tight text-gray-900 transition-colors duration-300 cursor-pointer sm:text-xl lg:text-2xl font-playfair hover:text-red-500 hover:underline"
              onClick={handleOrganizerClick}
            >
              {organizer?.organizerName || "N/A"}
            </h3>
            <p className="max-w-lg mx-auto text-sm italic leading-relaxed text-gray-700 sm:text-base font-inter sm:mx-0">
              {organizer?.organizerDesc || t("eventDetailPage.noDescription")}
            </p>
          </div>
          {currentUser?.email !== organizer?.organizerEmail && (
            <button
              onClick={handleChatClick}
              className="absolute p-2 transition-colors duration-200 bg-blue-100 rounded-full top-4 right-4 hover:bg-blue-200"
              title={t("eventDetailPage.organizedBy")}
            >
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </button>
          )}
        </div>
      </div>
      {isChatOpen && (
        <ChatBubble
          currentUser={currentUser}
          initialSelectedUser={{
            userId: hostId,
            email: organizer?.organizerEmail,
            name: organizer?.organizerName || "Organizer",
          }}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

// EventInfo Component
const EventInfo = ({ eventData, organizerData, currentUser, t }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [coordinates, setCoordinates] = useState(null);
  const [mapError, setMapError] = useState(null);
  const GOONG_API_KEY = 'LCv2x0WklhLYAtlkZD2BafC5xgsvBLGfvOrH85KY';
  const GOONG_MAPTILES_KEY = '86BxcY13sfsT38WWDKsjrCwD5vQG52emVDLddjmF';

  // Fetch coordinates using Goong Geocoding API
  useEffect(() => {
    if (!eventData?.eventLocation?.address || !GOONG_API_KEY) {
      //setMapError(t("eventDetailPage.mapErrorNoAddress"));
      return;
    }

    const fetchCoordinates = async () => {
      try {
        const address = encodeURIComponent(eventData.eventLocation.address);
        const response = await axios.get(
          `https://rsapi.goong.io/geocode?api_key=${GOONG_API_KEY}&address=${address}`
        );
        console.log("Geocode response:", response.data);
        const location = response.data.results?.[0]?.geometry?.location;
        if (!location) {
          throw new Error("No coordinates found");
        }
        setCoordinates({ lng: location.lng, lat: location.lat });
      } catch (error) {
        console.error("Error fetching coordinates:", error);
        setMapError(t("eventDetailPage.mapErrorGeocode"));
      }
    };

    fetchCoordinates();
  }, [eventData?.eventLocation?.address, GOONG_API_KEY, t]);

  // Initialize map
  useEffect(() => {
    if (!coordinates || !mapContainerRef.current || !GOONG_MAPTILES_KEY) {
      if (!GOONG_MAPTILES_KEY) {
        setMapError(t("eventDetailPage.mapErrorKeyMissing"));
      }
      return;
    }

    try {
      goongjs.accessToken = GOONG_MAPTILES_KEY;
      const map = new goongjs.Map({
        container: mapContainerRef.current,
        style: "https://tiles.goong.io/assets/goong_map_web.json",
        center: [coordinates.lng, coordinates.lat],
        zoom: 14,
      });

      const marker = new goongjs.Marker({ color: "#ff0000" })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map);

      mapRef.current = map;
      markerRef.current = marker;

      map.on("error", (e) => {
        console.error("Map error:", e);
        setMapError(t("eventDetailPage.mapErrorLoad"));
      });

      return () => {
        if (markerRef.current) markerRef.current.remove();
        if (mapRef.current) mapRef.current.remove();
      };
    } catch (error) {
      console.error("Failed to initialize map:", error);
      setMapError(t("eventDetailPage.mapErrorInit"));
    }
  }, [coordinates, GOONG_MAPTILES_KEY, t]);

  return (
    <div className="flex-1">
      <div className="mb-2 text-sm text-gray-500 sm:text-base">
        {formatDateTime(eventData?.eventStart)}
      </div>
      <h1 className="mb-3 text-2xl font-bold text-blue-900 sm:text-3xl lg:text-5xl sm:mb-4">
        {eventData?.eventName || t("pageViewAll.unnamedEvent")}
      </h1>
      <div className="flex items-center mb-2 text-sm text-gray-700 sm:text-base">
        <i className="mr-4 fa-solid fa-eye"></i>
        <span className="text-[14px] font-bold">
          {eventData?.viewCount
            ? eventData.viewCount === 1
              ? t("eventDetailPage.oneView")
              : t("eventDetailPage.views", { count: eventData.viewCount })
            : t("eventDetailPage.noViews")}
        </span>
      </div>
      <OrganizedBy organizer={organizerData} currentUser={currentUser} hostId={eventData?.userId} t={t} />
      <div className="pt-6 mt-6 mb-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-800 sm:text-xl font-playfair">
          {t("eventDetailPage.dateAndTime")}
        </h2>
        <div className="flex items-center text-sm text-gray-700 sm:text-base">
          <i className="mr-4 fa-regular fa-calendar-days"></i>
          <span className="text-[14px] font-bold">
            {formatDateTime(eventData?.eventStart)} -{" "}
            {formatDateTime(eventData?.eventEnd)}
          </span>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-800 sm:text-xl font-playfair">
          {t("eventDetailPage.location")}
        </h2>
        <div className="flex items-center text-sm text-gray-700 sm:text-base">
          <i className="mr-4 fa-solid fa-location-dot"></i>
          <span className="text-[14px] font-bold">
            {eventData?.eventLocation?.venueName
              ? `${eventData.eventLocation.venueName}, ${eventData.eventLocation.address}, ${eventData.eventLocation.city}`
              : t("eventDetailPage.noLocation")}
          </span>
        </div>
        {eventData?.eventLocation?.locationType === "venue" && (
          <div className="mt-4 h-[200px] sm:h-[300px] w-full relative">
            <div ref={mapContainerRef} style={{ width: "100%", height: "100%", position: "relative" }} />
            {mapError && (
              <p className="mt-2 text-sm text-red-500">
                {mapError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// OverviewContent Component
const OverviewContent = ({ eventData, t }) => (
  <div className="flex-1 mb-4 sm:mb-6">
    <h2 className="mb-2 text-lg font-bold text-gray-800 sm:text-xl lg:text-xl">
      {t("eventDetailPage.descriptions")}
    </h2>
    <div
      className="mb-3 text-sm prose text-justify text-gray-700 sm:text-base sm:mb-4 max-w-none"
      dangerouslySetInnerHTML={{
        __html: eventData?.eventDesc
          ? DOMPurify.sanitize(eventData.eventDesc)
          : t("eventDetailPage.noDescription"),
      }}
    />
    <h2 className="mb-2 text-lg font-bold text-gray-800 sm:text-xl lg:text-xl">
      {t("eventDetailPage.overview")}
    </h2>
    <div className="text-sm text-justify text-gray-700 sm:text-base">
      <p
        className="mb-3 sm:mb-4"
        dangerouslySetInnerHTML={{
          __html: eventData?.textContent
            ? DOMPurify.sanitize(eventData.textContent)
            : t("eventDetailPage.noDescription"),
        }}
      />
      {eventData?.seatingMapImage?.length > 0 ? (
        <img
          src={`${eventData?.seatingMapImage}?w=300&h=200&q=80`}
          alt={`${eventData.eventName || t("pageViewAll.unnamedEvent")}`}
          className="object-contain w-full max-w-[450px] h-auto mb-3 rounded-lg sm:mb-4"
        />
      ) : (
        <></>
      )}
      {eventData?.mediaContent?.length > 0 ? (
        eventData.mediaContent.map((mediaContent, index) => (
          <img
            key={index}
            src={mediaContent}
            alt={`${eventData.eventName || t("pageViewAll.unnamedEvent")} media ${index + 1}`}
            className="object-cover w-full h-auto mb-3 rounded-lg sm:mb-4"
          />
        ))
      ) : (
        <></>
      )}
    </div>
  </div>
);

// TicketSelector Component
const TicketSelector = ({ tickets, selectedTickets, onQuantityChange, onSelect, user, t }) => {
  const { eventId } = useParams();
  const token = localStorage.getItem("token");

  const checkTicketLimit = async (ticketId, ticketType, currentCount) => {
    if (!user?.email) {
      localStorage.setItem("redirectEventId", eventId);
      if (ticketType === "Free" && currentCount > 1) {
        Swal.fire({
          icon: "warning",
          title: "    ",
          text: t("eventDetailPage.loginPrompt"),
          confirmButtonText: t("header.login"),
          showCancelButton: true,
          cancelButtonText: t("imageCropper.cancel"),
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          }
        });
        return false;
      }
      if (ticketType !== "Free" && currentCount > 10) {
        Swal.fire({
          icon: "warning",
          title: "   ",
          text: t("eventDetailPage.loginPrompt"),
          confirmButtonText: t("header.login"),
          showCancelButton: true,
          cancelButtonText: t("imageCropper.cancel"),
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          }
        });
        return false;
      }
      return true;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/ticket/${user.email}/check/${eventId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error(t("eventDetailPage.ticketLimitError"));
      const result = await response.json();

      if (result.statusCode !== 200) {
        Swal.fire({
          icon: "error",
          title: "   ",
          text: result.msg,
        });
        return false;
      }

      const { remainingFreeTickets, remainingPaidTickets } = result.data;
      if (ticketType === "Free" && currentCount > remainingFreeTickets) {
        Swal.fire({
          icon: "error",
          title: "   ",
          text: result.msg,
        });
        return false;
      }
      if (ticketType !== "Free" && currentCount > remainingPaidTickets) {
        Swal.fire({
          icon: "error",
          title: "   ",
          text: result.msg,
        });
        return false;
      }
      return true;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("favoritesPage.error", { message: "" }),
        text: t("eventDetailPage.ticketLimitError"),
      });
      return false;
    }
  };

  // Lọc các vé còn lại
  const availableTickets = tickets ? tickets.filter(ticket => ticket.quantity - ticket.sold > 0) : [];

  return (
    <div className="w-full sm:w-[400px] lg:w-[450px] bg-white border border-gray-200 rounded-xl p-6 shadow-lg mt-6 sm:mr-10 top-6">
      <div className="p-4 mb-4 border-2 border-red-400 rounded-lg">
        {!tickets ? (
          <p className="text-sm text-gray-700 font-inter">{t("eventDetailPage.loadingTickets")}</p>
        ) : tickets.length === 0 || availableTickets.length === 0 ? (
          <p className="text-sm font-semibold text-red-600 font-inter">{t("eventDetailPage.soldOut")}</p>
        ) : (
          <div className="space-y-4">
            {availableTickets.map((ticket) => (
              <div
                key={ticket.ticketId}
                className="p-4 transition-all duration-300 bg-gray-100 border border-gray-400 rounded-lg hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-base font-semibold text-gray-900 font-inter">
                      {ticket.ticketName}
                    </p>
                    <p className="text-sm text-gray-700 font-inter">
                      {ticket.price.toLocaleString()} VND
                      {ticket.ticketType === "Free" && (
                        <span className="ml-2 text-xs text-gray-500">
                          {t("eventDetailPage.maxOneTicket")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      className="bg-gray-200 text-gray-600 px-3 py-1 rounded-[4px] hover:bg-gray-300 transition text-sm font-inter"
                      onClick={() =>
                        onQuantityChange(
                          ticket.ticketId,
                          ticket.quantity - ticket.sold,
                          -1,
                          ticket.ticketType
                        )
                      }
                      disabled={(selectedTickets[ticket.ticketId] || 0) === 0}
                      aria-label={`Giảm số lượng cho ${ticket.ticketName}`}
                    >
                      -
                    </button>
                    <span className="w-8 text-sm font-semibold text-center text-gray-900 font-inter">
                      {selectedTickets[ticket.ticketId] || 0}
                    </span>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-[4px] hover:bg-red-600 transition text-sm font-inter"
                      onClick={async () => {
                        const currentCount = (selectedTickets[ticket.ticketId] || 0) + 1;
                        const canIncrease = await checkTicketLimit(
                          ticket.ticketId,
                          ticket.ticketType,
                          currentCount
                        );
                        if (canIncrease) {
                          onQuantityChange(
                            ticket.ticketId,
                            ticket.quantity - ticket.sold,
                            1,
                            ticket.ticketType
                          );
                        }
                      }}
                      disabled={
                        (selectedTickets[ticket.ticketId] || 0) >=
                        (ticket.quantity - ticket.sold)
                      }
                      aria-label={`Tăng số lượng cho ${ticket.ticketName}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 font-inter">
                  <p>{t("eventDetailPage.available", { count: ticket.quantity - ticket.sold })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        className="w-full py-3 text-base font-semibold text-white transition bg-red-500 rounded-lg shadow-md hover:bg-red-600 disabled:bg-gray-400 font-inter"
        onClick={onSelect}
        disabled={Object.keys(selectedTickets).length === 0 || availableTickets.length === 0}
        aria-label={t("eventDetailPage.selectTickets")}
      >
        {t("eventDetailPage.selectTickets")}
      </button>
    </div>
  );
};

// Sponsors Component
const Sponsors = ({ sponsors, t }) => {
  if (!sponsors?.length) {
    return null;
  }

  return (
    <div className="my-4 sm:my-6">
      <h2 className="mb-3 text-lg font-bold sm:text-xl lg:text-xl sm:mb-4">
        {t("eventDetailPage.sponsors")}
      </h2>
      <div className="flex flex-wrap gap-4">
        {sponsors.map((sponsor) => (
          <div key={sponsor.sponsorId} className="flex items-center">
            <img
              src={sponsor.sponsorLogo}
              alt={`${sponsor.sponsorName} logo`}
              className="object-contain w-16 h-16"
            />
            <span className="ml-2 text-sm sm:text-base">
              {sponsor.sponsorName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main EventDetail Component
const EventDetail = () => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [segmentData, setSegments] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [speakers, setSpeakers] = useState([]);
  const [tickets, setTickets] = useState(null);
  const [sponsors, setSponsors] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const { user } = useAuth();
  const { data, loading, error } = useEventData(eventId, user?.userId);

  useEffect(() => {
    if (data) {
      setEventData(data.event);
      setSegments(data.segments);
      setTickets(data.tickets);
      setSponsors(data.sponsors);
      setOrganizer(data.organizer);
      setSpeakers(
        data.segments?.map((segment) => segment.speaker).filter(Boolean) || []
      );
    }
    window.scrollTo(0, 0);
  }, [data]);

  const handleQuantityChange = (ticketId, maxQuantity, delta, ticketType) => {
    setSelectedTickets((prev) => {
      const currentCount = prev[ticketId] || 0;
      const newCount = calculateNewCount(
        currentCount,
        delta,
        maxQuantity,
        ticketType
      );
      return updateTickets(prev, ticketId, newCount);
    });
  };

  const getSelectedTicketsData = () => {
    return (
      tickets
        ?.filter((ticket) => selectedTickets[ticket.ticketId] > 0)
        .map((ticket) => ({
          ...ticket,
          quantity: selectedTickets[ticket.ticketId],
        })) || []
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-center text-red-600 sm:p-8 sm:text-base">
        {t("listEventScroll.error", { message: error })}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <style jsx global>{`
        .carousel,
        .slider-wrapper,
        .slider {
          height: 100% !important;
        }
      `}</style>
      <div className="relative w-full max-w-[1200px] mx-auto mt-4 sm:mt-6 h-[200px] sm:h-[350px] lg:h-[500px] rounded-lg overflow-hidden shadow-lg">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          showIndicators={true}
          dynamicHeight={false}
          className="w-full h-full"
        >
          {eventData?.eventImages?.length > 0 ? (
            eventData.eventImages.map((imageUrl, index) => (
              <div key={index} className="relative w-full h-full">
                <div
                  className="absolute inset-0 scale-110 bg-center bg-cover blur-lg"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                ></div>
                <img
                  src={imageUrl}
                  alt={`${t("pageViewAll.unnamedEvent")} ${index + 1}`}
                  className="absolute inset-0 object-contain w-auto h-auto max-w-full max-h-full m-auto"
                />
              </div>
            ))
          ) : (
            <div className="relative w-full h-full">
              <div
                className="absolute inset-0 scale-110 bg-center bg-cover blur-lg"
                style={{
                  backgroundImage: `url(https://via.placeholder.com/1200x500)`,
                }}
              ></div>
              <img
                src="https://via.placeholder.com/1200x500"
                alt={t("pageViewAll.unnamedEvent")}
                className="absolute inset-0 object-contain w-auto h-auto max-w-full max-h-full m-auto"
              />
            </div>
          )}
        </Carousel>
      </div>
      <div className="px-4 pt-6 sm:px-6 lg:px-8 sm:pt-8">
        <div className="px-4 pt-4 leading-normal rounded-lg sm:px-6">
          <div className="flex flex-col items-start gap-4 lg:flex-row sm:gap-6 lg:gap-2">
            <div className="w-full ml-4 lg:flex-1 sm:ml-6 lg:ml-10">
              <EventInfo eventData={eventData} organizerData={organizer} currentUser={user} t={t} />
              <OverviewContent eventData={eventData} t={t} />
              <SliderSpeaker speakers={speakers} />
              <Timeline segments={segmentData} t={t} />
              <Sponsors sponsors={sponsors} t={t} />
              <div>
                <h2 className="mt-3 mb-3 text-lg font-bold sm:text-xl lg:text-2xl sm:mb-4 sm:mt-4">
                  {t("eventDetailPage.tags")}
                </h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {eventData?.tags?.split("|").map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs text-gray-800 bg-gray-100 rounded-full sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {tag.trim()}
                    </span>
                  )) || (
                      <span className="text-xs text-gray-600 sm:text-sm">
                        {t("eventDetailPage.noTags")}
                      </span>
                    )}
                </div>
              </div>
            </div>
            <TicketSelector
              tickets={tickets}
              selectedTickets={selectedTickets}
              onQuantityChange={handleQuantityChange}
              onSelect={() => setShowPopup(true)}
              user={user}
              t={t}
            />
          </div>
        </div>
      </div>
      {showPopup && (
        <Checkout
          onClose={() => setShowPopup(false)}
          selectedTickets={getSelectedTicketsData()}
          eventData={eventData}
        />
      )}
      <ListEventScroll />
      <Footer />
    </div>
  );
};

export default EventDetail;