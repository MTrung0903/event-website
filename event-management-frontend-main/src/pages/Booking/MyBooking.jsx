import { useEffect, useState } from "react";
import axios from 'axios';
import EmptyOrder from './empty-orders.jpg';
import { toast } from 'react-toastify';
import { FaTicketAlt, FaDownload, FaUndoAlt } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import Footer from "../../components/Footer";

export default function MyInvoice() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);

  const toggleOrder = (orderId) => {
    setOpenOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const convertTimestamp = (timestamp) => {
    console.log("Time: ", timestamp);
    const year = timestamp?.slice(0, 4);
    const month = timestamp?.slice(4, 6);
    const day = timestamp?.slice(6, 8);
    const hour = timestamp?.slice(8, 10);
    const minute = timestamp?.slice(10, 12);
    const second = timestamp?.slice(12, 14);
    const shortYear = year?.slice(2);
    return `${hour}:${minute}:${second} ${day}/${month}/${shortYear}`;
  };

  useEffect(() => {
    if (toastMessage && toastType) {
      if (toastType === "info") {
        toast.info(toastMessage);
      }
      else if (toastType === "success") {
        toast.success(toastMessage);
      }
      else if (toastType === "error") {
        toast.error(toastMessage);
      }
      else if (toastType === "warn") {
        toast.warn(toastMessage);
      }
      setToastType(null);
      setToastMessage(null);
    }
  }, [toastMessage]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      let userId;
      if (token) {
        try {
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          userId = decodedPayload.userId;
        } catch (e) {
          setError(t('myBooking.errors.invalidToken'));
          setLoading(false);
          return;
        }
      } else {
        setError(t('myBooking.errors.noToken'));
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/booking/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
        setOrders(response.data);
      } catch (err) {
        setError(t('myBooking.errors.fetchOrdersFailed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [t]);

  const handleRefund = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      console.log(token);
      const response = await axios.get(`http://localhost:8080/api/v1/refund/valid/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
      if (response.data.statusCode === 1 || response.data.statusCode === "1") {
        const refundResponse = await axios.post(`http://localhost:8080/api/v1/refund/${orderId}`, null, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        console.log(refundResponse.data);
        setToastMessage(t('myBooking.success.refundSuccess'));
        setToastType("success");
        window.location.reload();
      } else {
        setToastMessage(response.data.msg);
        setToastType("warn");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('myBooking.errors.refundFailed');
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/api/v1/invoice/${orderId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setToastMessage(t('myBooking.errors.downloadFailed'));
      setToastType("error");
    }
  };

  const viewTicket = (orderId) => {
    window.location.href = `/view-tickets/${orderId}`;
  };

  const statusColors = {
    SUCCESSFULLY: "text-green-600",
    REFUNDED: "text-yellow-600",
    FAILED: "text-red-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-900 tracking-tight">
        {t('myBooking.title')}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">{t('myBooking.error')}</h2>
          <p className="text-gray-600 max-w-md">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src={EmptyOrder}
            alt={t('myBooking.noInvoices')}
            className="w-64 h-64 mb-6 object-contain"
          />
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            {t('myBooking.noInvoices')}
          </h2>
          <p className="text-gray-500 max-w-md">
            {t('myBooking.noInvoicesDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-8 max-w-4xl mx-auto">
          {orders.map((order) => {
            const isOpen = openOrders.includes(order.orderId);
            return (
              <div
                key={order.orderId}
                className="bg-white shadow-lg rounded-2xl p-6 transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 cursor-pointer"
                  onClick={() => toggleOrder(order.orderId)}
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {t('myBooking.invoiceId')}{order.orderId}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {t('myBooking.transactionTime')} {convertTimestamp(order.transaction?.transactionDate)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('myBooking.status')}{" "}
                      <span className={`font-medium ${statusColors[order.transaction?.transactionStatus] || "text-gray-600"}`}>
                        {order.transaction?.transactionStatus || "FAILED"}
                      </span>
                    </p>
                  </div>
                  <div className="text-right mt-4 sm:mt-0">
                    <p className="text-lg font-semibold text-blue-600">
                      {t('myBooking.total')} {order.transaction?.paymentMethod !== "PayPal" ? order.transaction?.transactionAmount: order.transaction?.transactionAmountUSD} {order.transaction?.paymentMethod !== "PayPal" ? t('currency.vnd'): t('currency.usd')}
                    </p>
                    <p className="text-sm text-blue-500 font-medium">
                      {isOpen ? t('myBooking.hideDetails') : t('myBooking.viewDetails')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:space-x-6">
                  <div className="w-full md:w-40 mb-4 md:mb-0">
                    <img
                      className="w-full h-32 object-cover rounded-lg"
                      src={order.event.eventImages[0] || "https://via.placeholder.com/150"}
                      alt={order.event.eventName}
                      onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      {t('myBooking.event')} {order.event.eventName}
                    </h2>
                    <p className="text-sm text-gray-600 mb-1">
                      {t('myBooking.start')} {new Date(order.event.eventStart).toLocaleString("vi-VN")}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      {t('myBooking.end')} {new Date(order.event.eventEnd).toLocaleString("vi-VN")}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      {t('myBooking.host')} {order.event.eventHost}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('myBooking.location')} {order.event.eventLocation
                        ? `${order.event.eventLocation.venueName}, ${order.event.eventLocation.address}, ${order.event.eventLocation.city}`
                        : t('eventDetailPage.noLocation')}
                    </p>
                  </div>
                </div>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="space-y-4 mt-6">
                    {order.tickets.map((ticket, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row justify-between items-start border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {ticket.ticketName}
                          </h3>
                        </div>
                        <div className="text-right mt-4 md:mt-0 w-full md:w-1/3">
                          <p className="text-sm text-gray-600">
                            {t('myBooking.price')} ${ticket.price}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t('myBooking.quantity')} {ticket.quantity}
                          </p>
                          <p className="text-base font-semibold text-gray-800 mt-1">
                            {t('myBooking.subtotal')} ${ticket.price * ticket.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => viewTicket(order.orderId)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    <FaTicketAlt />
                    {t('myBooking.viewTickets')}
                  </button>

                  <button
                    onClick={() => downloadInvoice(order.orderId)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    <FaDownload />
                    {t('myBooking.downloadInvoice')}
                  </button>

                  {order.transaction?.transactionStatus !== "REFUNDED" && order.transaction?.paymentMethod !== "N/A" && (
                    <button
                      onClick={() => setSelectedOrderId(order.orderId)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      <FaUndoAlt />
                      {t('myBooking.refund')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">{t('myBooking.confirmRefund')}</h2>
            <p className="text-gray-700">{t('myBooking.refundPrompt')}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                {t('myBooking.cancel')}
              </button>
              <button
                onClick={() => {
                  handleRefund(selectedOrderId);
                  setSelectedOrderId(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('myBooking.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}