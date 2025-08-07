import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import TicketItem from "./TicketItem";
import Footer from "../../components/Footer";
import Loader from "../../components/Loading";

export default function ViewAllTickets() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState("eventStart");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);

      let userId;
      if (!token) {
        setError(t("viewAllTickets.errors.loginRequired"));
        setLoading(false);
        return;
      }

      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        userId = decodedPayload.userId;
      } catch (e) {
        setError(t("viewAllTickets.errors.invalidToken"));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/ticket/view-all-tickets/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            params: {
              page,
              size: 10,
              sortBy,
              sortOrder,
              date: filterDate,
              search,
            },
          }
        );
        setData(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        if (err.response?.status === 400) {
          setError(t("viewAllTickets.errors.invalidDateFormat"));
        } else {
          setError(t("viewAllTickets.errors.loadFailed"));
        }
        setData([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, sortBy, sortOrder, filterDate, search]);

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split(":");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(0);
  };

  const handleDateFilter = (e) => {
    setFilterDate(e.target.value);
    setPage(0);
  };

  const handleSearch = debounce((e) => {
    setSearch(e.target.value);
    setPage(0);
  }, 300);

  return (
    <>
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">{t("viewAllTickets.title")}</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            className="border p-2 rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleSortChange}
            value={`${sortBy}:${sortOrder}`}
          >
            <option value="eventStart:asc">{t("viewAllTickets.sort.dateAsc")}</option>
            <option value="eventStart:desc">{t("viewAllTickets.sort.dateDesc")}</option>
            <option value="price:asc">{t("viewAllTickets.sort.priceAsc")}</option>
            <option value="price:desc">{t("viewAllTickets.sort.priceDesc")}</option>
          </select>
          <input
            type="date"
            className="border p-2 rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDate}
            onChange={handleDateFilter}
            placeholder={t("viewAllTickets.filter.datePlaceholder")}
          />
          <input
            type="text"
            className="border p-2 rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("viewAllTickets.filter.searchPlaceholder")}
            onChange={handleSearch}
          />
        </div>
        {error && (
          <p className="text-center text-red-500 mb-4">{error}</p>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            {!error && data.length === 0 && totalPages === 0 && (
              <p className="text-center text-gray-500">{t("viewAllTickets.noTickets")}</p>
            )}
            <div className="space-y-2">
              {data.map((ticket) => (
                <TicketItem
                  key={ticket?.ticketInfo?.ticketId}
                  ticket={ticket}
                  event={ticket?.eventInfo}
                />
              ))}
            </div>
            {totalPages > 0 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  className="border p-2 rounded disabled:opacity-50 hover:bg-blue-100"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  {t("viewAllTickets.pagination.previous")}
                </button>
                <span>
                  {t("viewAllTickets.pagination.page", { current: page + 1, total: totalPages })}
                </span>
                <button
                  className="border p-2 rounded disabled:opacity-50 hover:bg-blue-100"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  {t("viewAllTickets.pagination.next")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}