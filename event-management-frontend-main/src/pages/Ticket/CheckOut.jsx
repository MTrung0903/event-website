import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loader from "../../components/Loading";
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ onClose, selectedTickets, eventData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);
  const totalPrice = selectedTickets.reduce(
    (sum, ticket) => sum + ticket.price * ticket.quantity,
    0
  );

  useEffect(() => {
    if (toastMessage && toastType) {
      if (toastType === "info") {
        toast.info(toastMessage);
      } else if (toastType === "success") {
        toast.success(toastMessage);
      } else if (toastType === "error") {
        toast.error(toastMessage);
      } else if (toastType === "warn") {
        toast.warn(toastMessage);
      }
      setToastType(null);
      setToastMessage(null);
    }
  }, [toastMessage]);

  const buyFreeTicket = async (checkoutData) => {
    setIsLoading(true); // Start loading
    const token = localStorage.getItem('token');
    let userId;

    if (!token) {
      setToastMessage(t("checkout.errors.tokenMissing"));
      setToastType("error");
      setIsLoading(false); // Stop loading
      return;
    }

    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      userId = decodedPayload.userId;

      const tickets = checkoutData?.tickets?.reduce((acc, ticket) => {
        acc[ticket.ticketId] = ticket.quantity;
        return acc;
      }, {});

      const data = {
        orderInfo: checkoutData?.eventData.eventName,
        eventId: checkoutData?.eventData.eventId,
        amount: 0,
        userId: userId,
        tickets: tickets,
      };

      const response = await axios.post('http://localhost:8080/api/v1/payment/free-ticket', data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.statusCode === 1 || response.data.statusCode === "1") {
        navigate(`/payment-result?orderCode=${response.data.data}`);
      } else {
        setToastMessage(t("checkout.errors.unexpectedResponse"));
        setToastType("error");
      }
    } catch (error) {
      setToastMessage(t("checkout.errors.paymentFailed"));
      setToastType("error");
      console.error("Error in buyFreeTicket:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const checkoutHandle = async () => {
    setIsLoading(true); // Start loading for checkout
    const checkoutData = {
      amount: totalPrice,
      tickets: selectedTickets,
      eventData: eventData,
    };
    localStorage.setItem('eventCheckout', window.location.href);
    if (totalPrice > 0) {
      navigate("/checkout", { state: checkoutData });
      setIsLoading(false); // Stop loading after navigation
    } else {
      await buyFreeTicket(checkoutData); // Await API call
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center">
            <Loader />
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t("checkout.title")}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900" disabled={isLoading}>
            ✕
          </button>
        </div>

        <div className="w-full bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">{t("checkout.orderSummary")}</h3>
          {selectedTickets.length === 0 ? (
            <p className="text-gray-700 mb-2">{t("checkout.noTickets")}</p>
          ) : (
            selectedTickets.map((ticket) => (
              <p key={ticket.ticketId} className="text-gray-700 mb-2">
                {t("checkout.ticketLine", { quantity: ticket.quantity, ticketName: ticket.ticketName })}
                <span className="float-right">
                  {(ticket.price * ticket.quantity).toLocaleString()} {t("currency.vnd")}
                </span>
              </p>
            ))
          )}
          <p className="text-gray-700 mb-2">
            {t("checkout.delivery")} <span className="float-right">{t("checkout.eTicket", { count: selectedTickets.length })}</span>
          </p>
          <hr className="my-4" />
          <p className="text-xl font-semibold">
            {t("checkout.total")} <span className="float-right">{totalPrice.toLocaleString()} {t("currency.vnd")}</span>
          </p>
        </div>

        <button
          className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 mt-4 disabled:bg-blue-300"
          onClick={checkoutHandle}
          disabled={isLoading}
        >
          {isLoading ? t("checkout.processing") : t("checkout.proceedToPayment")}
        </button>
      </div>
    </div>
  );
};

export default Checkout;