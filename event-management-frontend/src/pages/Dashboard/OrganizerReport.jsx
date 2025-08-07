import { useState, useEffect, useRef, Component } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import Loader from "../../components/Loading";
// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

// Error Boundary for Chart
class ChartErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-center text-red-600">Lỗi khi hiển thị biểu đồ</div>;
    }
    return this.props.children;
  }
}

const OrganizerDashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedYear, setSelectedYear] = useState("");
  const eventsPerPage = 4;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const chartRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  // Generate list of years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);

  // Translation for dynamic labels
  const formatLabel = (label) => {
    if (!label) return t('organizerDashboard.noEvents');
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  };

  const getCategoryLabel = (label, namespace = 'sliderEvent') => {
    const translationKey = `${namespace}.${label.toLowerCase()}`;
    const translated = t(translationKey);
    if (translated === translationKey) {
      console.warn(`Missing translation for: ${translationKey}`);
      return formatLabel(label);
    }
    return translated;
  };

  const fetchDashboardData = async (year = "") => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/organizer/dashboard", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: { year },
      });

      console.log("API Response:", response.data); // Log để kiểm tra dữ liệu

      const months = [
        t('months.jan'), t('months.feb'), t('months.mar'), t('months.apr'),
        t('months.may'), t('months.jun'), t('months.jul'), t('months.aug'),
        t('months.sep'), t('months.oct'), t('months.nov'), t('months.dec')
      ];

      setData({
        ...response.data,
        revenueOverTime: {
          labels: months,
          data: response.data.revenueByMonth || Array(12).fill(0), // Đảm bảo mảng 12 số 0 nếu null
        },
      });
    } catch (error) {
      setError(t('organizerDashboard.error', { message: error.message }));
      console.error(t('organizerDashboard.error', { message: error.message }));
      setData({
        totalEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        totalSponsors: 0,
        revenueByMonth: Array(12).fill(0),
        ticketTypeCount: {},
        events: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDashboardData(selectedYear);

    return () => {
      if (chartRef.current?.destroy) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [navigate, token, selectedYear]);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredEvents = data.events?.filter(event =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryLabel(event.eventType).toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventLocation.venueName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;

    const aValue = sortConfig.key === 'event' ? a.eventName.toLowerCase() :
      sortConfig.key === 'location' ? a.eventLocation.venueName.toLowerCase() :
        sortConfig.key === 'sold' ? a.sold :
          sortConfig.key === 'gross' ? a.eventRevenue :
            getCategoryLabel(a.eventStatus, 'eventStatus').toLowerCase();
    const bValue = sortConfig.key === 'event' ? b.eventName.toLowerCase() :
      sortConfig.key === 'location' ? b.eventLocation.venueName.toLowerCase() :
        sortConfig.key === 'sold' ? b.sold :
          sortConfig.key === 'gross' ? b.eventRevenue :
            getCategoryLabel(b.eventStatus, 'eventStatus').toLowerCase();

    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const stats = [
    { title: t('organizerDashboard.totalEvents'), value: data.totalEvents, icon: 'fas fa-calendar-check', color: '#a5d8ff' },
    { title: t('organizerDashboard.ticketsSold'), value: data.totalTicketsSold, icon: 'fas fa-ticket-alt', color: '#d8b4fe' },
    { title: t('organizerDashboard.totalRevenue'), value: `${data.totalRevenue?.toLocaleString() ?? 0} ${t('currency.vnd')}`, icon: 'fas fa-dollar-sign', color: '#fed7aa' },
    { title: t('organizerDashboard.sponsors'), value: data.totalSponsors, icon: 'fas fa-handshake', color: '#a7f3d0' },
  ];

  const revenueOverTimeData = {
    labels: data.revenueOverTime?.labels || [],
    datasets: [
      {
        label: t('organizerDashboard.revenueOverTime'),
        data: (data.revenueOverTime?.data || []).map(value => value ?? 0), // Thay null/undefined bằng 0
        fill: false,
        borderColor: '#3b82f6',
        tension: 0.1,
      },
    ],
  };

  return isLoading ? (
    <div className="flex justify-center items-center h-screen">
      <Loader />
    </div>
  ) : (
    <section className="space-y-6 overflow-y-auto p-6">
      <div className="bg-white rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold text-lg text-[#1e1e2d] select-none">
            {t('organizerDashboard.header')} - {data.organizer || 'N/A'}
          </h1>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            aria-label={t('organizerDashboard.allYears')}
          >
            <option value="">{t('organizerDashboard.allYears')}</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 max-w-[1440px]">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-[#f9fafb] rounded-xl p-4 min-w-[200px] flex flex-col items-center text-center"
            >
              <div className={`rounded-full p-2 mb-2`} style={{ backgroundColor: stat.color }}>
                <i className={`${stat.icon} text-[#1e293d]`}></i>
              </div>
              <p className="mb-1 text-sm text-gray-600 select-none">{stat.title}</p>
              <p className="font-bold text-lg text-[#1e1e2d]">{stat.value}</p>
            </div>
          ))}
        </div>

        <h1 className="mb-4 text-lg font-bold select-none">{t('organizerDashboard.statistics')}</h1>
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-1">
          <div className="bg-[#f9fafb] rounded-xl p-4">
            <h2 className="mb-4 text-sm font-semibold">
              {t('organizerDashboard.revenueOverTime')} {selectedYear ? `(${selectedYear})` : ''}
            </h2>
            <div className="relative" style={{ maxHeight: '300px' }}>
              <ChartErrorBoundary>
                <Line
                  key={`chart-${selectedYear}`} // Thêm key để tái tạo canvas
                  ref={chartRef}
                  data={revenueOverTimeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                      title: {
                        display: true,
                        text: `${t('organizerDashboard.revenueOverTime')} ${selectedYear ? `(${selectedYear})` : ''}`
                      },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />

              </ChartErrorBoundary>
            </div>
          </div>
        </div>

        <h1 className="mb-4 text-lg font-bold select-none">{t('organizerDashboard.yourEvents')}</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('organizerDashboard.searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none f ocus:ring-2 focus:ring-[#3b82f6]"
            aria-label={t('organizerDashboard.searchPlaceholder')}
          />
        </div>
        <div className="mt-6 bg-white rounded-md shadow text-[14px]">
          <div className="flex items-center p-4 border-b border-gray-200">
            <div
              className="flex items-center w-1/2 text-gray-600 cursor-pointer"
              onClick={() => handleSort('event')}
              aria-label={t('organizerDashboard.event')}
            >
              {t('organizerDashboard.event')}
              {sortConfig.key === 'event' && (
                <span className="ml-2">
                  {sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                </span>
              )}
            </div>
            <div
              className="flex items-center w-1/6 text-gray-600 cursor-pointer"
              onClick={() => handleSort('location')}
              aria-label={t('organizerDashboard.location')}
            >
              {t('organizerDashboard.location')}
              {sortConfig.key === 'location' && (
                <span className="ml-2">
                  {sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                </span>
              )}
            </div>
            <div
              className="flex items-center w-1/6 text-gray-600 cursor-pointer"
              onClick={() => handleSort('sold')}
              aria-label={t('organizerDashboard.sold')}
            >
              {t('organizerDashboard.sold')}
              {sortConfig.key === 'sold' && (
                <span className="ml-2">
                  {sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                </span>
              )}
            </div>
            <div
              className="flex items-center w-1/6 text-gray-600 cursor-pointer"
              onClick={() => handleSort('gross')}
              aria-label={t('organizerDashboard.gross')}
            >
              {t('organizerDashboard.gross')}
              {sortConfig.key === 'gross' && (
                <span className="ml-2">
                  {sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                </span>
              )}
            </div>
            <div
              className="flex items-center w-1/6 text-gray-600 cursor-pointer"
              onClick={() => handleSort('status')}
              aria-label={t('organizerDashboard.status')}
            >
              {t('organizerDashboard.status')}
              {sortConfig.key === 'status' && (
                <span className="ml-2">
                  {sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                </span>
              )}
            </div>
          </div>

          {currentEvents.map((event) => (
            <div key={event.eventId} className="flex items-center p-4 relative hover:bg-gray-100">
              <div className="w-1/2 flex items-center space-x-4 text-[13px]">
                {event.eventImages[0] ? (
                  <img
                    src={event.eventImages[0]}
                    alt={event.eventName}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-gray-500">{t('organizerDashboard.noImage')}</span>
                  </div>
                )}
                <div>
                  <h3 className="text-[16px] font-semibold">{event.eventName}</h3>
                  <p className="text-gray-600">{getCategoryLabel(event.eventType)}</p>
                </div>
              </div>
              <div className="w-1/6 text-gray-600">{event.eventLocation.venueName}</div>
              <div className="w-1/6 text-gray-600">{event.sold}</div>
              <div className="w-1/6 text-gray-600">{event.eventRevenue?.toLocaleString() ?? 0} {t('currency.vnd')}</div>
              <div className="w-1/6 text-gray-600">{getCategoryLabel(event.eventStatus, 'eventStatus')}</div>
            </div>
          ))}

        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end mt-4 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm ${currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              aria-label={t('organizerDashboard.previous')}
            >
              {t('organizerDashboard.previous')}
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md text-sm ${currentPage === page
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                aria-label={`${t('organizerDashboard.page')} ${page}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              aria-label={t('organizerDashboard.next')}
            >
              {t('organizerDashboard.next')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrganizerDashboard;