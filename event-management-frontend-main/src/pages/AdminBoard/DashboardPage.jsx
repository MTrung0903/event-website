import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import SidebarAdminBoard from "./Sidebar";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DashboardPage = () => {
  const [data, setData] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  // Thêm trạng thái cho sắp xếp
  const [sortConfig, setSortConfig] = useState({ key: 'eventName', direction: 'asc' });
  const eventsPerPage = 4;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);

  const getStats = async (year = "") => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/admin/dashboard/stats", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: { year },
      });
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const revenueByMonth = Array(12).fill(0);
      response.data.data.transactions?.forEach(transaction => {
        const monthStr = transaction.transactionDate.substring(4, 6);
        const monthIndex = parseInt(monthStr, 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          revenueByMonth[monthIndex] += (transaction.transactionAmount * 0.03);
        }
      });
      const revenueOverTime = { labels: months, data: revenueByMonth };
      setData({ ...response.data.data, revenueOverTime });
    } catch (error) {
      setError(error.message);
      console.error("Error fetching data:", error);
      setData({
        totalActiveEvents: 0,
        totalRevenueYTD: 0,
        averageTicketPrice: 0,
        refundRate: 0,
        newOrganizersThisMonth: 0,
        bookingConversionRate: 0,
        topEventCategory: 'N/A',
        userEngagementScore: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getEvents = async (search = "", page = 0, size = eventsPerPage, sort = "") => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/admin/dashboard/events", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: { search, page, size, sort },
      });
      //console.log('API Response:', response.data);
      setEvents(response.data.data.content);
      setTotalPages(response.data.data.totalPages || 1);
      setTotalElements(response.data.data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events: ' + (err.response?.data?.message || err.message));
      setEvents([]);
      setTotalPages(1);
      setTotalElements(0);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const sortParam = sortConfig.key ? `${sortConfig.key},${sortConfig.direction}` : '';
    getEvents(searchTerm, currentPage - 1, eventsPerPage, sortParam);
  }, [currentPage, searchTerm, sortConfig]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    getStats(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    // Gửi tham số sort dưới dạng "key,direction"
    const sortParam = sortConfig.key ? `${sortConfig.key},${sortConfig.direction}` : '';
    getEvents(searchTerm, currentPage - 1, eventsPerPage, sortParam);
  }, [currentPage, searchTerm, sortConfig]);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Hàm xử lý khi nhấp vào tiêu đề cột để sắp xếp
  const handleSort = (key) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig.key === key) {
        // Đảo chiều nếu cùng cột
        return {
          key,
          direction: prevSortConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      // Mặc định sắp xếp tăng dần cho cột mới
      return { key, direction: 'asc' };
    });
    setCurrentPage(1); // Quay về trang đầu khi thay đổi sắp xếp
  };

  const stats = [
    { title: 'Total Events', value: data.totalEvents ?? 0, icon: 'fas fa-calendar-check', color: '#a5d8ff', change: data.eventChange },
    { title: `Revenue YTD ${selectedYear ? `(${selectedYear})` : ''}`, value: `${data.totalRevenueYTD?.toLocaleString() ?? 0} Đ`, icon: 'fas fa-dollar-sign', color: '#fed7aa', change: data.revenueChange },
    { title: 'Ticket sold', value: `${data.totalTicketsSold ?? 0}`, icon: 'fas fa-ticket-alt', color: '#d8b4fe', change: data.ticketChange },
    { title: 'Refund Rate', value: `${data.refundRate > 0 ? data.refundRate?.toFixed(2) : 0}%`, icon: 'fas fa-undo', color: '#f87171', change: '' },
    { title: 'New Organizers This Month', value: data.newOrganizersThisMonth ?? 0, icon: 'fas fa-user-plus', color: '#a7f3d0', change: data.organizerChange },
    { title: 'Booking Conversion Rate', value: `${data.bookingConversionRate ?? 0}%`, icon: 'fas fa-check-circle', color: '#22c55e', change: data.bookingChange },
    { title: 'Top Event Category', value: data.topEventCategory ?? 'N/A', icon: 'fas fa-chart-line', color: '#3b82f6', change: '' },
    { title: 'Average Event Attendance Rate', value: `${data.averageAttendanceRate > 0 ? data.averageAttendanceRate?.toFixed(2) : 0}%`, icon: 'fas fa-users', color: '#9ca3af', change: '' },
  ];
 // console.log("Stats: ", stats);
  const eventTypeCount = data.events?.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {}) || {};

  // Hàm chuyển đổi HSL sang Hex
  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Hàm tạo mảng màu phân biệt
  const generateDistinguishableColors = (count) => {
    const colors = [];
    const saturation = 70; // Độ bão hòa 70% để màu sắc rực rỡ nhưng không quá chói
    const lightness = 60; // Độ sáng 60% để tránh màu quá tối hoặc quá nhạt

    // Phân bổ đều hue trên vòng màu (0-360 độ)
    const hueStep = 360 / count; // Khoảng cách hue giữa các màu

    for (let i = 0; i < count; i++) {
      const hue = i * hueStep; // Hue được phân bổ đều
      colors.push(hslToHex(hue, saturation, lightness));
    }

    return colors;
  };

  // Tạo mảng màu ngẫu nhiên phân biệt
  const labels = Object.keys(eventTypeCount);
  const randomBackgroundColors = generateDistinguishableColors(labels.length);
  const randomHoverColors = randomBackgroundColors.map((color) => {
    // Tạo màu hover bằng cách làm sáng hơn (tăng lightness)
    const hue = parseInt(color.substr(1), 16) >> 16;
    const saturation = 70;
    const lightness = 70; // Tăng độ sáng cho hover
    return hslToHex(hue % 360, saturation, lightness);
  });

  const eventTypeData = {
    labels: labels,
    datasets: [
      {
        data: Object.values(eventTypeCount),
        backgroundColor: randomBackgroundColors,
        hoverBackgroundColor: randomHoverColors,
        hoverOffset: 4,
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };

  const revenueOverTimeData = {
    labels: data.revenueOverTime?.labels || [],
    datasets: [
      {
        label: 'Revenue',
        data: data.revenueOverTime?.data || [],
        fill: false,
        borderColor: '#3b82f6',
        tension: 0.1,
      },
    ],
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getPaginationButtons = () => {
    const maxButtons = 5;
    const buttons = [];
    const halfMax = Math.floor(maxButtons / 2);

    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(1);
      if (startPage > 2) buttons.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttons.push('...');
      buttons.push(totalPages);
    }

    return buttons;
  };

  // Hàm để lấy biểu tượng sắp xếp
  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
    return 'fas fa-sort';
  };

  return (
    <section className="space-y-6 overflow-y-auto">
      <div className="p-6 bg-white rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold text-sm text-[#1e1e2d] select-none">Overview</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 max-w-[1440px]">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-[#f9fafb] rounded-xl p-4 w-28 min-w-[200px] flex flex-col items-center text-center"
            >
              <div className={`rounded-full p-2 mb-2`} style={{ backgroundColor: stat.color }}>
                <i className={`${stat.icon} text-[#1e293d]`}></i>
              </div>
              <p className="text-[10px] text-gray-600 mb-1 select-none">{stat.title}</p>
              <p className="font-bold text-sm text-[#1e1e2d] mb-1">{stat.value}</p>
              {stat.change && (
                <p className={`text-xs font-semibold select-none flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-[#22c55e]' : 'text-[#f87171]'}`}>
                  <i className={`fas ${stat.change.startsWith('+') ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                  {stat.change}
                  <span className="font-normal text-gray-500"> from last month</span>
                </p>
              )}
            </div>
          ))}
        </div>

        <h1 className="mb-4 text-sm font-bold select-none">Statistics</h1>
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
          <div className="bg-[#f9fafb] rounded-xl p-4">
            <h2 className="mb-4 text-sm font-semibold">Revenue Over Time {selectedYear ? `(${selectedYear})` : ''}</h2>
            <div className="relative" style={{ maxHeight: '300px' }}>
              <Line
                data={revenueOverTimeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `Revenue Over Time ${selectedYear ? `(${selectedYear})` : ''}` },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-[#f9fafb] rounded-xl p-4">
            <h2 className="mb-4 text-sm font-semibold">Event Type Distribution {selectedYear ? `(${selectedYear})` : ''}</h2>
            <div className="relative" style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '100%', maxWidth: '400px', height: '300px' }}>
                <Doughnut
                  data={eventTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false, // Allow custom height
                    plugins: {
                      legend: {
                        position: 'bottom', // Move legend below the chart to save space
                        labels: {
                          boxWidth: 10, // Reduce legend item box size
                          padding: 5, // Reduce padding between legend items
                          font: {
                            size: 12, // Adjust font size for compactness
                          },
                        },
                      },
                      title: {
                        display: true,
                        text: `Event Types ${selectedYear ? `(${selectedYear})` : ''}`,
                      },
                      tooltip: { enabled: true },
                    },
                    animation: { duration: 500, easing: 'easeOutQuart' },
                    cutout: '60%', // Maintain doughnut shape
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-sm font-bold select-none">Event List</h1>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search by event name or organizer..."
              value={searchTerm}
              onChange={handleSearch}
              className="p-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] w-full"
            />
            {searchTerm.length > 0 && (
              <button
                onClick={handleClearSearch}
                className="absolute text-gray-500 transform -translate-y-1/2 right-2 top-1/2 hover:text-gray-700"
                title="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
        <div className="mt-6 bg-white rounded-md shadow text-[14px]">
          <div className="flex items-center p-4 border-b border-gray-200">
            <div
              className="flex items-center w-1/2 text-gray-600 cursor-pointer"
              onClick={() => handleSort('eventName')}
            >
              Event
              <i className={`${getSortIcon('eventName')} ml-2`}></i>
            </div>
            <div
              className="flex items-center justify-center w-1/6 text-center text-gray-600 cursor-pointer"
              onClick={() => handleSort('eventHost')}
            >
              Organizer
              <i className={`${getSortIcon('eventHost')} ml-2`}></i>
            </div>
            <div
              className="flex items-center justify-center w-1/6 text-center text-gray-600 cursor-pointer"
              onClick={() => handleSort('sold')}
            >
              Sold
              <i className={`${getSortIcon('sold')} ml-2`}></i>
            </div>
            <div
              className="flex items-center justify-center w-1/6 text-center text-gray-600 cursor-pointer"
              onClick={() => handleSort('eventRevenue')}
            >
              Gross
              <i className={`${getSortIcon('eventRevenue')} ml-2`}></i>
            </div>
            <div
              className="flex items-center justify-center w-1/6 text-center text-gray-600 cursor-pointer"
              onClick={() => handleSort('eventStatus')}
            >
              Status
              <i className={`${getSortIcon('eventStatus')} ml-2`}></i>
            </div>
          </div>
          {loading ? (
            <div className="p-4 text-center text-gray-600">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">{error}</div>
          ) : !events || events.length === 0 ? (
            <div className="p-4 text-center text-gray-600">No events match your search</div>
          ) : (
            events.map((event) => (
              <div key={event.eventId} className="relative flex items-center p-4 hover:bg-gray-100">
                <div className="w-1/2 flex items-center space-x-4 text-[13px]">
                  {event.eventImages && event.eventImages.length > 0 ? (
                    <img
                      src={event.eventImages[0]}
                      alt={event.eventName}
                      className="object-cover w-16 h-16 h-20 rounded-lg shadow-sm sm:w-20"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-16 h-16 h-20 bg-gray-100 rounded-lg shadow-sm sm:w-20">
                      <span className="text-xs text-gray-500 sm:text-sm">No image</span>
                    </div>
                  )}
                  <div>
                    <a href = {`/event/${event.eventId}`} className="text-[16px] font-semibold hover:underline">{event.eventName}</a>
                    <p className="text-gray-600">
                      {event.eventLocation
                        ? `${event.eventLocation.venueName}${event.eventLocation.city ? `, ${event.eventLocation.city}` : ''}`
                        : 'No location specified'}
                    </p>
                    <p className="text-gray-600">{event.eventType}</p>
                  </div>
                </div>
                <div className="w-1/6 text-center text-gray-600">{event.eventHost}</div>
                <div className="w-1/6 text-center text-gray-600">{event.sold}</div>
                <div className="w-1/6 text-center text-gray-600">{event.eventRevenue.toLocaleString()} Đ</div>
                <div className="w-1/6 text-center text-gray-600">{event.eventStatus}</div>
              </div>
            ))
          )}
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
            >
              Previous
            </button>
            {getPaginationButtons().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                className={`px-3 py-1 rounded-md text-sm ${page === '...'
                  ? 'bg-gray-200 text-gray-700 cursor-default'
                  : currentPage === page
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                disabled={page === '...'}
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
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardPage;