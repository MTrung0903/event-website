import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import imgTicket from "../../assets/NoOrder.png";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Scanner } from "@yudiel/react-qr-scanner";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import Loader from "../../components/Loading";
ChartJS.register(ArcElement, Tooltip, Legend);

const TicketDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({});
  const [ticketTypes, setTicketTypes] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [checkInTickets, setCheckInTickets] = useState([]);
  const [eventInfo, setEventInfo] = useState({});
  const { eventId } = useParams();
  const [searchTicketTerm, setSearchTicketTerm] = useState("");
  const [searchOrderTerm, setSearchOrderTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isScanning, setIsScanning] = useState(false);
  const [qrResults, setQrResults] = useState([]);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [exportOption, setExportOption] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const fetchData = async () => {
      try {
        const [statsRes, ticketTypesRes, recentOrdersRes, checkInTicketsRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/ticket/${eventId}/stats`, config)
            .catch((err) => {
              toast.error(t("ticketSold.errors.fetchStatsFailed"));
              throw err;
            }),
          axios.get(`http://localhost:8080/api/ticket/${eventId}/ticket-types`, config)
            .catch((err) => {
              toast.error(t("ticketSold.errors.fetchTicketTypesFailed"));
              throw err;
            }),
          axios.get(`http://localhost:8080/api/ticket/${eventId}/recent-orders`, config)
            .catch((err) => {
              toast.error(t("ticketSold.errors.fetchOrdersFailed"));
              throw err;
            }),
          axios.get(`http://localhost:8080/api/ticket/${eventId}/check-in-tickets`, config)
            .catch((err) => {
              toast.error(t("ticketSold.errors.fetchCheckInFailed"));
              throw err;
            }),
        ]);

        setStats(statsRes.data);
        setTicketTypes(ticketTypesRes.data);
        setRecentOrders(recentOrdersRes.data);
        setCheckInTickets(checkInTicketsRes.data);
      } catch (err) {
        // Errors are already handled in individual catch blocks with toast notifications
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckIn = async (ticketCode) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(
        `http://localhost:8080/api/ticket/${eventId}/check-in/${ticketCode}`,
        config
      );

      if (response.data.statusCode === 0) {
        if (response.data.msg === "The ticket was checked") {
          toast.warning(t("ticketSold.warnings.ticketAlreadyChecked", { ticketCode }));
          return false;
        } else if (response.data.msg === "The ticket was canceled") {
          toast.error(t("ticketSold.errors.ticketCanceled", { ticketCode }));
          return false;
        } else if (response.data.msg === "The Ticket not in this event!") {
          toast.error(t("ticketSold.errors.ticketNotInEvent", { ticketCode }));
          return false;
        } else if (response.data.msg === "The Ticket not found!") {
          toast.error(t("ticketSold.errors.ticketNotFound", { ticketCode }));
          return false;
        }
      }

      toast.success(t("ticketSold.success.checkInSuccess", { ticketCode }));
      const updatedTickets = await axios.get(
        `http://localhost:8080/api/ticket/${eventId}/check-in-tickets`,
        config
      );
      setCheckInTickets(updatedTickets.data);
      const updatedStats = await axios.get(
        `http://localhost:8080/api/ticket/${eventId}/stats`,
        config
      );
      setStats(updatedStats.data);
      return true;
    } catch (err) {
      toast.error(
        t("ticketSold.errors.checkInFailed", {
          ticketCode,
          message: err.response?.data?.message || err.message,
        })
      );
      return false;
    }
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key && prevConfig.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortData = (data, key, direction) => {
    return [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredRecentOrders = recentOrders.filter(
    (order) =>
      order.orderId?.toLowerCase().includes(searchOrderTerm.toLowerCase()) ||
      order.name?.toLowerCase().includes(searchOrderTerm.toLowerCase())
  );

  const sortedRecentOrders = sortConfig.key
    ? sortData(filteredRecentOrders, sortConfig.key, sortConfig.direction)
    : filteredRecentOrders;

  const filteredCheckInTickets = checkInTickets.filter(
    (ticket) =>
      ticket.ticketCode?.toLowerCase().includes(searchTicketTerm.toLowerCase())
  );

  const sortedCheckInTickets = sortConfig.key
    ? sortData(filteredCheckInTickets, sortConfig.key, sortConfig.direction)
    : filteredCheckInTickets;

  const handleClearSearchOrder = () => {
    setSearchOrderTerm("");
  };
  const handleClearSearchTicket = () => {
    setSearchTicketTerm("");
  };

  const exportToExcel = () => {
    let dataToExport = [...sortedCheckInTickets];

    if (exportOption === "checked") {
      dataToExport = dataToExport.filter((ticket) => ticket.status === "Checked");
    } else if (exportOption === "unchecked") {
      dataToExport = dataToExport.filter((ticket) => ticket.status !== "Checked");
    }

    const worksheetData = dataToExport.map((ticket) => ({
      [t("ticketSold.table.ticketCode")]: ticket.ticketCode,
      [t("ticketSold.table.status")]: ticket.status,
      [t("ticketSold.table.checkInDate")]: ticket.checkDate || t("ticketSold.na"),
      [t("ticketSold.table.ticketType")]: ticket.ticketType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("ticketSold.table.sheetName"));
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    FileSaver.saveAs(dataBlob, `${t("ticketSold.table.fileName", { eventId, exportOption })}`);
    toast.success(t("ticketSold.success.exportSuccess"));
    setIsExportDropdownOpen(false);
  };

  const ticketTypeChartData = {
    labels: ticketTypes.map((t) => t.ticketType),
    datasets: [
      {
        data: ticketTypes.map((t) => parseInt(t.sold.split("/")[0])),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  const ticketStatusChartData = {
    labels: [
      t("ticketSold.chart.sold"),
      t("ticketSold.chart.checked"),
      t("ticketSold.chart.canceled"),
    ],
    datasets: [
      {
        data: [
          parseInt(stats.ticketsSold?.split("/")[0]) || 0,
          parseInt(stats.ticketsChecked) || 0,
          parseInt(stats.ticketsCancelled) || 0,
        ],
        backgroundColor: ["#36A2EB", "#4BC0C0", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#4BC0C0", "#FF6384"],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true },
    },
    maintainAspectRatio: false,
  };

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <Loader />
    </div>
  ) : (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t("ticketSold.title")}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsScanning(!isScanning)}
            className="p-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            {isScanning ? t("ticketSold.closeScanner") : t("ticketSold.scanQR")}
          </button>
          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {t("ticketSold.exportExcel")}
            </button>
            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <button
                  onClick={() => {
                    setExportOption("all");
                    exportToExcel();
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  {t("ticketSold.exportAll")}
                </button>
                <button
                  onClick={() => {
                    setExportOption("checked");
                    exportToExcel();
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  {t("ticketSold.exportChecked")}
                </button>
                <button
                  onClick={() => {
                    setExportOption("unchecked");
                    exportToExcel();
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  {t("ticketSold.exportUnchecked")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isScanning && (
        <div className="mt-6 bg-white p-4 rounded-md shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t("ticketSold.scanTitle")}</h2>
          <div
            className="mt-4"
            style={{ width: "100%", maxWidth: "400px", margin: "auto" }}
          >
            <Scanner
              onScan={(result) => {
                if (result.length > 0) {
                  const ticketCode = result[0].rawValue;
                  if (!qrResults.includes(ticketCode)) {
                    setQrResults([...qrResults, ticketCode]);
                    handleCheckIn(ticketCode);
                  }
                }
              }}
              onError={(error) => {
                toast.error(t("ticketSold.errors.cameraError", { message: error.message }));
                setIsScanning(false);
              }}
            />
            {qrResults.length > 0 && (
              <div className="mt-2 text-center">
                <p className="font-semibold">{t("ticketSold.scannedTickets")}</p>
                <ul className="list-disc list-inside">
                  {qrResults.map((code, index) => (
                    <li className="list-none" key={index}>
                      {code}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-md shadow border border-orange-600">
          <div className="text-orange-600 p-2">{t("ticketSold.stats.ticketsSold")}</div>
          <div className="text-2xl font-bold text-orange-900 p-2">
            {stats.ticketsSold || "0/0"}
          </div>
        </div>
        <div className="p-4 bg-white rounded-md shadow border border-orange-600">
          <div className="text-orange-600 p-2">{t("ticketSold.stats.ticketsChecked")}</div>
          <div className="text-2xl font-bold text-orange-900 p-2">
            {stats.ticketsChecked || "0"}
          </div>
        </div>
        <div className="p-4 bg-white rounded-md shadow border border-orange-600">
          <div className="text-orange-600 p-2">{t("ticketSold.stats.ticketsCancelled")}</div>
          <div className="text-2xl font-bold text-orange-900 p-2">
            {stats.ticketsCancelled || "0"}
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-md shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t("ticketSold.chart.ticketTypeDistribution")}</h2>
          <div style={{ height: "300px" }}>
            <Pie data={ticketTypeChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t("ticketSold.chart.ticketStatus")}</h2>
          <div style={{ height: "300px" }}>
            <Pie data={ticketStatusChartData} options={chartOptions} />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-900">{t("ticketSold.table.salesByTicketType")}</h2>
        <table className="mt-4 w-full bg-white rounded-md border border-gray-200">
          <thead>
            <tr className="text-left bg-gray-200 text-orange-500">
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("ticketType")}
              >
                {t("ticketSold.table.ticketType")}
                {sortConfig.key === "ticketType" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("sold")}
              >
                {t("ticketSold.table.sold")}
                {sortConfig.key === "sold" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("price")}
              >
                {t("ticketSold.table.price")}
                {sortConfig.key === "price" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {ticketTypes.map((ticket, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{ticket.ticketType}</td>
                <td className="px-4 py-2">{ticket.sold}</td>
                <td className="px-4 py-2">{ticket.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t("ticketSold.table.recentOrders")}</h2>
          <div className="relative">
            <input
              type="text"
              placeholder={t("ticketSold.searchOrdersPlaceholder")}
              className="p-2 border border-gray-300 rounded-md"
              value={searchOrderTerm}
              onChange={(e) => setSearchOrderTerm(e.target.value)}
            />
            {searchOrderTerm.length > 0 && (
              <button
                onClick={handleClearSearchOrder}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                title={t("ticketSold.clearSearch")}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
        <table className="mt-4 w-full bg-white rounded-[20px] border border-gray-200">
          <thead>
            <tr className="text-left bg-gray-200 text-orange-500">
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("orderId")}
              >
                {t("ticketSold.table.orderId")}
                {sortConfig.key === "orderId" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                {t("ticketSold.table.name")}
                {sortConfig.key === "name" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("quantity")}
              >
                {t("ticketSold.table.quantity")}
                {sortConfig.key === "quantity" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("ticketType")}
              >
                {t("ticketSold.table.ticketType")}
                {sortConfig.key === "ticketType" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("price")}
              >
                {t("ticketSold.table.price")}
                {sortConfig.key === "price" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("date")}
              >
                {t("ticketSold.table.date")}
                {sortConfig.key === "date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRecentOrders.length === 0 ? (
              <tr className="border-t">
                <td colSpan="6" className="px-4 py-8 text-center text-gray-600">
                  <img
                    alt={t("ticketSold.noOrdersAlt")}
                    className="mx-auto mb-4"
                    src={imgTicket}
                    width="150"
                    height="150"
                  />
                  {t("ticketSold.noOrders")}
                </td>
              </tr>
            ) : (
              sortedRecentOrders.map((order, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{order.orderId}</td>
                  <td className="px-4 py-2">{order.name}</td>
                  <td className="px-4 py-2">{order.quantity}</td>
                  <td className="px-4 py-2">{order.ticketType}</td>
                  <td className="px-4 py-2">{order.price}</td>
                  <td className="px-4 py-2">{order.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t("ticketSold.table.checkInTickets")}</h2>
          <div className="relative">
            <input
              type="text"
              placeholder={t("ticketSold.searchTicketsPlaceholder")}
              className="p-2 border border-gray-300 rounded-md"
              value={searchTicketTerm}
              onChange={(e) => setSearchTicketTerm(e.target.value)}
            />
            {searchTicketTerm.length > 0 && (
              <button
                onClick={handleClearSearchTicket}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                title={t("ticketSold.clearSearch")}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
        <table className="mt-4 w-full bg-white rounded-[20px] border border-gray-200">
          <thead>
            <tr className="text-left bg-gray-200 text-orange-500">
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("ticketCode")}
              >
                {t("ticketSold.table.ticketCode")}
                {sortConfig.key === "ticketCode" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("status")}
              >
                {t("ticketSold.table.status")}
                {sortConfig.key === "status" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("checkDate")}
              >
                {t("ticketSold.table.checkInDate")}
                {sortConfig.key === "checkDate" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("ticketType")}
              >
                {t("ticketSold.table.ticketType")}
                {sortConfig.key === "ticketType" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCheckInTickets.length === 0 ? (
              <tr className="border-t">
                <td colSpan="4" className="px-4 py-8 text-center text-gray-600">
                  <img
                    alt={t("ticketSold.noCheckInAlt")}
                    className="mx-auto mb-4"
                    src={imgTicket}
                    width="150"
                    height="150"
                  />
                  {t("ticketSold.noCheckInTickets")}
                </td>
              </tr>
            ) : (
              sortedCheckInTickets.map((ticket, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{ticket.ticketCode}</td>
                  <td className="px-4 py-2">{ticket.status === 'Checked' ? t('ticketSold.table.checked')  : (ticket.status === 'Uncheck' ? t('ticketSold.table.uncheck') : t('ticketSold.table.cancelled'))}</td>
                  <td className="px-4 py-2">{ticket.checkDate}</td>
                  <td className="px-4 py-2">{ticket.ticketType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketDashboard;