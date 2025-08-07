import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import EventList from "../../components/EventListSearch";
import Footer from "../../components/Footer";
import Loader from "../../components/Loading";
import { useTranslation } from "react-i18next";

const FilterSidebar = ({
  onFilterChange,
  selectedCategories,
  setSelectedCategories,
  selectedEventLocation,
  setSelectedEventLocation,
  selectedEventStart,
  setSelectedEventStart,
  selectedTicketType,
  setSelectedTicketType,
  eventCategories,
  t,
  topCities
}) => {
  const allEventLocations = [
    { id: "all-locations", label: t("searchPage.allLocations") },
    { id: "ho-chi-minh", label: t("searchPage.locations.hoChiMinh") },
    { id: "ha-noi", label: t("searchPage.locations.haNoi") },
    { id: "da-nang", label: t("searchPage.locations.daNang") },
    { id: "hai-phong", label: t("searchPage.locations.haiPhong") },
    { id: "can-tho", label: t("searchPage.locations.canTho") },
    { id: "nha-trang", label: t("searchPage.locations.nhaTrang") },
    { id: "da-lat", label: t("searchPage.locations.daLat") },
    { id: "binh-duong", label: t("searchPage.locations.binhDuong") },
    { id: "dong-nai", label: t("searchPage.locations.dongNai") },
    { id: "quang-ninh", label: t("searchPage.locations.quangNinh") },
    { id: "an-giang", label: t("searchPage.locations.anGiang") },
    { id: "ba-ria-vung-tau", label: t("searchPage.locations.baRiaVungTau") },
    { id: "bac-giang", label: t("searchPage.locations.bacGiang") },
    { id: "bac-kan", label: t("searchPage.locations.bacKan") },
    { id: "bac-lieu", label: t("searchPage.locations.bacLieu") },
    { id: "bac-ninh", label: t("searchPage.locations.bacNinh") },
    { id: "ben-tre", label: t("searchPage.locations.benTre") },
    { id: "binh-dinh", label: t("searchPage.locations.binhDinh") },
    { id: "binh-phuoc", label: t("searchPage.locations.binhPhuoc") },
    { id: "binh-thuan", label: t("searchPage.locations.binhThuan") },
    { id: "ca-mau", label: t("searchPage.locations.caMau") },
    { id: "cao-bang", label: t("searchPage.locations.caoBang") },
    { id: "dak-lak", label: t("searchPage.locations.dakLak") },
    { id: "dak-nong", label: t("searchPage.locations.dakNong") },
    { id: "dien-bien", label: t("searchPage.locations.dienBien") },
    { id: "dong-thap", label: t("searchPage.locations.dongThap") },
    { id: "gia-lai", label: t("searchPage.locations.giaLai") },
    { id: "ha-giang", label: t("searchPage.locations.haGiang") },
    { id: "ha-nam", label: t("searchPage.locations.haNam") },
    { id: "ha-tinh", label: t("searchPage.locations.haTinh") },
    { id: "hai-duong", label: t("searchPage.locations.haiDuong") },
    { id: "hau-giang", label: t("searchPage.locations.hauGiang") },
    { id: "hoa-binh", label: t("searchPage.locations.hoaBinh") },
    { id: "hung-yen", label: t("searchPage.locations.hungYen") },
    { id: "khanh-hoa", label: t("searchPage.locations.khanhHoa") },
    { id: "kien-giang", label: t("searchPage.locations.kienGiang") },
    { id: "kon-tum", label: t("searchPage.locations.konTum") },
    { id: "lai-chau", label: t("searchPage.locations.laiChau") },
    { id: "lam-dong", label: t("searchPage.locations.lamDong") },
    { id: "lang-son", label: t("searchPage.locations.langSon") },
    { id: "lao-cai", label: t("searchPage.locations.laoCai") },
    { id: "long-an", label: t("searchPage.locations.longAn") },
    { id: "nam-dinh", label: t("searchPage.locations.namDinh") },
    { id: "nghe-an", label: t("searchPage.locations.ngheAn") },
    { id: "ninh-binh", label: t("searchPage.locations.ninhBinh") },
    { id: "ninh-thuan", label: t("searchPage.locations.ninhThuan") },
    { id: "phu-tho", label: t("searchPage.locations.phuTho") },
    { id: "phu-yen", label: t("searchPage.locations.phuYen") },
    { id: "quang-binh", label: t("searchPage.locations.quangBinh") },
    { id: "quang-nam", label: t("searchPage.locations.quangNam") },
    { id: "quang-ngai", label: t("searchPage.locations.quangNgai") },
    { id: "soc-trang", label: t("searchPage.locations.socTrang") },
    { id: "son-la", label: t("searchPage.locations.sonLa") },
    { id: "tay-ninh", label: t("searchPage.locations.tayNinh") },
    { id: "thai-binh", label: t("searchPage.locations.thaiBinh") },
    { id: "thai-nguyen", label: t("searchPage.locations.thaiNguyen") },
    { id: "thanh-hoa", label: t("searchPage.locations.thanhHoa") },
    { id: "thua-thien-hue", label: t("searchPage.locations.thuaThienHue") },
    { id: "tien-giang", label: t("searchPage.locations.tienGiang") },
    { id: "tra-vinh", label: t("searchPage.locations.traVinh") },
    { id: "tuyen-quang", label: t("searchPage.locations.tuyenQuang") },
    { id: "vinh-long", label: t("searchPage.locations.vinhLong") },
    { id: "vinh-phuc", label: t("searchPage.locations.vinhPhuc") },
    { id: "yen-bai", label: t("searchPage.locations.yenBai") }
  ];

  // Ánh xạ từ tên tiếng Việt sang slug để so sánh
  const nameToSlugMap = {
    "TP. Hồ Chí Minh": "ho-chi-minh",
    "Hà Nội": "ha-noi",
    "Đà Nẵng": "da-nang",
    "Hải Phòng": "hai-phong",
    "Cần Thơ": "can-tho",
    "Nha Trang": "nha-trang",
    "Đà Lạt": "da-lat",
    "Bình Dương": "binh-duong",
    "Đồng Nai": "dong-nai",
    "Quảng Ninh": "quang-ninh",
    "An Giang": "an-giang",
    "Bà Rịa - Vũng Tàu": "ba-ria-vung-tau",
    "Bắc Giang": "bac-giang",
    "Bắc Kạn": "bac-kan",
    "Bạc Liêu": "bac-lieu",
    "Bắc Ninh": "bac-ninh",
    "Bến Tre": "ben-tre",
    "Bình Định": "binh-dinh",
    "Bình Phước": "binh-phuoc",
    "Bình Thuận": "binh-thuan",
    "Cà Mau": "ca-mau",
    "Cao Bằng": "cao-bang",
    "Đắk Lắk": "dak-lak",
    "Đắk Nông": "dak-nong",
    "Điện Biên": "dien-bien",
    "Đồng Tháp": "dong-thap",
    "Gia Lai": "gia-lai",
    "Hà Giang": "ha-giang",
    "Hà Nam": "ha-nam",
    "Hà Tĩnh": "ha-tinh",
    "Hải Dương": "hai-duong",
    "Hậu Giang": "hau-giang",
    "Hòa Bình": "hoa-binh",
    "Hưng Yên": "hung-yen",
    "Khánh Hòa": "khanh-hoa",
    "Kiên Giang": "kien-giang",
    "Kon Tum": "kon-tum",
    "Lai Châu": "lai-chau",
    "Lâm Đồng": "lam-dong",
    "Lạng Sơn": "lang-son",
    "Lào Cai": "lao-cai",
    "Long An": "long-an",
    "Nam Định": "nam-dinh",
    "Nghệ An": "nghe-an",
    "Ninh Bình": "ninh-binh",
    "Ninh Thuận": "ninh-thuan",
    "Phú Thọ": "phu-tho",
    "Phú Yên": "phu-yen",
    "Quảng Bình": "quang-binh",
    "Quảng Nam": "quang-nam",
    "Quảng Ngãi": "quang-ngai",
    "Sóc Trăng": "soc-trang",
    "Sơn La": "son-la",
    "Tây Ninh": "tay-ninh",
    "Thái Bình": "thai-binh",
    "Thái Nguyên": "thai-nguyen",
    "Thanh Hóa": "thanh-hoa",
    "Huế": "hue",
    "Tiền Giang": "tien-giang",
    "Trà Vinh": "tra-vinh",
    "Tuyên Quang": "tuyen-quang",
    "Vĩnh Long": "vinh-long",
    "Vĩnh Phúc": "vinh-phuc",
    "Yên Bái": "yen-bai"
  };

  // Lọc eventLocations dựa trên topCities
  const eventLocations = allEventLocations.filter(location => {
    if (location.id === "all-locations") return true;
    const locationName = t(`searchPage.locations.${location.id.replace(/-/g, '')}`);
    console.log(`Checking location: ${location.id}, name: ${locationName}, in topCities: ${topCities.includes(locationName)}`);
    return topCities.includes(locationName) || Object.keys(nameToSlugMap).some(name => nameToSlugMap[name] === location.id && topCities.includes(name));
  });

  const eventStarts = [
    { id: "all-times", label: t("searchPage.allTimes") },
    { id: "this-week", label: t("searchPage.thisWeek") },
    { id: "this-month", label: t("searchPage.thisMonth") },
  ];

  const ticketTypes = [
    { id: "all-types", label: t("searchPage.allTicketTypes") },
    { id: "Free", label: t("searchPage.free") },
    { id: "Paid", label: t("searchPage.paid") },
  ];

  const formatLabel = (label) => {
    if (!label) return "Unknown";
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  };

  const getCategoryLabel = (label, id) => {
    if (id === "all-types") {
      return t("searchPage.allTypes");
    }
    const translationKey = `sliderEvent.${label.toLowerCase()}`;
    const translated = t(translationKey);
    if (translated === translationKey) {
      console.warn(`Missing translation for: ${translationKey}`);
      return formatLabel(label);
    }
    return translated;
  };

  return (
    <div className="w-full bg-white p-6 rounded-[4px] space-y-8 border-r border-gray-200">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-xl font-bold">{t("searchPage.filters")}</h2>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">{t("searchPage.eventTypes")}</h3>
        {eventCategories.length === 0 ? (
          <p className="text-sm text-gray-500">{t("searchPage.loadingEventTypes")}</p>
        ) : (
          <div className="space-y-3" style={{ maxHeight: '210px', overflowY: 'auto' }}>
            {eventCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center space-x-3 text-[13px]"
              >
                <input
                  id={category.id}
                  type="radio"
                  name="eventCategory"
                  checked={selectedCategories === category.label}
                  onChange={() => setSelectedCategories(category.label)}
                  className="w-4 h-4 border-2 border-orange-500 accent-red-500"
                />
                <label
                  htmlFor={category.id}
                  className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-red-500"
                >
                  {getCategoryLabel(category.label, category.id)}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">{t("searchPage.location")}</h3>
        <div className="space-y-3" style={{ maxHeight: '210px', overflowY: 'auto' }}>
          {eventLocations.map((location) => (
            <div
              key={location.id}
              className="flex items-center space-x-3 text-[13px]"
            >
              <input
                id={location.id}
                type="radio"
                name="eventLocation"
                checked={selectedEventLocation === location.id}
                onChange={() => setSelectedEventLocation(location.id)}
                className="w-4 h-4 border-2 border-orange-500 accent-red-500"
              />
              <label
                htmlFor={location.id}
                className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-red-500"
              >
                {location.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">{t("searchPage.time")}</h3>
        <div className="space-y-3">
          {eventStarts.map((time) => (
            <div
              key={time.id}
              className="flex items-center space-x-3 text-[13px]"
            >
              <input
                id={time.id}
                type="radio"
                name="eventStart"
                checked={selectedEventStart === time.id}
                onChange={() => setSelectedEventStart(time.id)}
                className="w-4 h-4 border-2 border-orange-500 accent-red-500"
              />
              <label
                htmlFor={time.id}
                className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-red-500"
              >
                {time.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">{t("searchPage.price")}</h3>
        <div className="space-y-3">
          {ticketTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center space-x-3 text-[13px]"
            >
              <input
                id={type.id}
                type="radio"
                name="ticketType"
                checked={selectedTicketType === type.id}
                onChange={() => setSelectedTicketType(type.id)}
                className="w-4 h-4 border-2 border-orange-500 accent-red-500"
              />
              <label
                htmlFor={type.id}
                className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-red-500"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState("all-types");
  const [selectedEventLocation, setSelectedEventLocation] = useState("all-locations");
  const [selectedEventStart, setSelectedEventStart] = useState("all-times");
  const [selectedTicketType, setSelectedTicketType] = useState("all-types");
  const [eventCategories, setEventCategories] = useState([{ id: "all-types", label: "All types" }]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [topCities, setTopCities] = useState([]);
  const location = useLocation();
  const [searchTitle, setSearchTitle] = useState(location.state?.searchTerm || "");
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchEventTypes = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch("http://localhost:8080/api/events-type/get-all-event-types", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch event types");
        const data = await response.json();
        const formattedCategories = [
          { id: "all-types", label: t("searchPage.allTypes") },
          ...data.map((type) => ({
            id: type.id,
            label: type.typeName,
          })),
        ];
        setEventCategories(formattedCategories);
      } catch (error) {
        console.error("Error fetching event types:", error);
        setEventCategories([{ id: "all-types", label: "All types" }]);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchTopCities = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/events/search/top-cities-popular");
        if (!response.ok) throw new Error("Failed to fetch top cities");
        const cities = await response.json();
        console.log("Fetched topCities:", cities);
        setTopCities(cities);
      } catch (error) {
        console.error("Error fetching top cities:", error);
        setTopCities([
          "TP. Hồ Chí Minh",
          "Hà Nội",
          "Đà Nẵng",
          "Đà Lạt",
          "Nha Trang",
          "Bình Dương"
        ]);
      }
    };

    fetchEventTypes();
    fetchTopCities();
  }, [token, t]);

  useEffect(() => {
    const initialEvents = location.state?.events || [];
    setEvents(initialEvents);
    setSearchTitle(location.state?.searchTerm || "");
    window.scrollTo(0, 0);
  }, [location.state]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (
        selectedCategories === "all-types" &&
        selectedEventLocation === "all-locations" &&
        selectedEventStart === "all-times" &&
        selectedTicketType === "all-types"
      ) {
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/events/search/multiple-filters?eventCategory=${selectedCategories}&eventLocation=${selectedEventLocation}&eventStart=${selectedEventStart}&ticketType=${selectedTicketType}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch events");
        const fetchedEvents = await response.json();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    window.scrollTo(0, 0);
  }, [
    selectedCategories,
    selectedEventLocation,
    selectedEventStart,
    selectedTicketType,
    token,
  ]);

  return loading || loadingCategories ? (
    <div className="flex items-center justify-center h-screen">
      <Loader />
    </div>
  ) : (
    <>
      <div className="px-6 py-4 mx-auto">
        <h1 className="mt-4 text-3xl font-bold text-gray-700 font-montserrat">
          {searchTitle
            ? t("searchPage.upcomingEventsFor", { searchTerm: searchTitle })
            : t("searchPage.upcomingEvents")}
        </h1>
        <div className="flex flex-col gap-2 p-5 md:flex-row">
          <div className="w-full md:w-1/4">
            <FilterSidebar
              onFilterChange={(filteredEvents) => setEvents(filteredEvents)}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedEventLocation={selectedEventLocation}
              setSelectedEventLocation={setSelectedEventLocation}
              selectedEventStart={selectedEventStart}
              setSelectedEventStart={setSelectedEventStart}
              selectedTicketType={selectedTicketType}
              setSelectedTicketType={setSelectedTicketType}
              eventCategories={eventCategories}
              t={t}
              topCities={topCities}
            />
          </div>
          <div className="w-full md:w-3/4">
            {events.length > 0 ? (
              <EventList event={events} />
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img
                  src="https://tse1.mm.bing.net/th?id=OIP.0gqW7kZ5vXz0l8mXq1yqAAHaE8&pid=Api"
                  alt={t("searchPage.noEvents")}
                  className="object-cover w-48 h-48 mb-4"
                />
                <p className="text-sm text-gray-600 sm:text-base">
                  {t("searchPage.noEvents")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;