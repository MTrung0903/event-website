import React from 'react';
import "../Checkout/checkout-page.css";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import VNPAY from "../../assets/VNPAY.jpeg";
import momo from "../../assets/MoMo.png";
import PayPal from "../../assets/PayPal.png";
import { toast } from 'react-toastify';
import Loader from "../../components/Loading";

const CheckoutPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);
  const checkoutData = location.state;
  const total = checkoutData?.tickets?.reduce((sum, ticket) => {
    return sum + ticket.price * ticket.quantity;
  }, 0);
  const [method, setMethod] = useState("");

  const handleClick = (method) => {
    setMethod(method);
  };

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

  const checkoutHandle = async () => {
    if (method === "") {
      setToastMessage("Select the payment method!");
      setToastType("warn");
      return;
    }

    setIsLoading(true); // Start loading
    const token = localStorage.getItem('token');
    let userId;

    if (token) {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      userId = decodedPayload.userId;
    } else {
      setToastMessage("Token does not exist.");
      setToastType("error");
      setIsLoading(false); // Stop loading
      return;
    }

    const tickets = checkoutData?.tickets?.reduce((acc, ticket) => {
      acc[ticket.ticketId] = ticket.quantity;
      return acc;
    }, {});

    const data = {
      orderInfo: checkoutData?.eventData.eventName,
      eventId: checkoutData?.eventData.eventId,
      amount: total,
      userId: userId,
      tickets: tickets,
    };

    try {
      let response;
      if (method === "MoMo") {
        response = await axios.post('http://localhost:8080/api/v1/payment/create-momo', data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        window.location.href = response.data.payUrl;
      } else if (method === "VNPAY") {
        response = await axios.post('http://localhost:8080/api/v1/payment/create-vnpay', data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        window.location.href = response.data.paymentUrl;
      } else if (method === "PayPal") {
        response = await axios.post('http://localhost:8080/api/v1/payment/paypal/pay', data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      setToastMessage(`Payment via ${method} failed. Please try again.`);
      setToastType("error");
      console.error(error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="checkout-page-container relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
          <Loader />
        </div>
      )}
      <div className="flex flex-wrap max-w-[950px] bg-white rounded-[12px] p-5 gap-[60px]">
        <div className="flex flex-col flex-1 min-w-[500px]">
          <span className="font-normal text-black text-[25px] mb-[25px]">Payment Method</span>
          <div
            className={`flex items-center justify-between p-[15px] rounded-[8px] border cursor-pointer mb-[15px] ${method === "MoMo" ? "border-2 border-blue-600 shadow-md bg-blue-50" : "border-[#e8e9eb]"}`}
            onClick={() => handleClick("MoMo")}
          >
            <div className="flex">
              <img className="mr-1" src={momo} alt="MoMo" width="25" />
              <span>MoMo</span>
            </div>
          </div>
          <div
            className={`flex items-center justify-between p-[15px] rounded-[8px] border cursor-pointer mb-[15px] ${method === "VNPAY" ? "border-2 border-blue-600 shadow-md bg-blue-50" : "border-[#e8e9eb]"}`}
            onClick={() => handleClick("VNPAY")}
          >
            <div className="flex">
              <img className="mr-1" src={VNPAY} alt="VNPAY" width="80px" />
              <span>VNPAY</span>
            </div>
          </div>
          <div
            className={`flex items-center justify-between p-[15px] rounded-[8px] border cursor-pointer mb-[15px] ${method === "PayPal" ? "border-2 border-blue-600 shadow-md bg-blue-50" : "border-[#e8e9eb]"}`}
            onClick={() => handleClick("PayPal")}
          >
            <div className="flex">
              <img className="mr-1" src={PayPal} alt="PayPal" width="80px" />
              <span>PayPal</span>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-[#f5f8ff] rounded-[12px] p-5">
          <div className="flex flex-col items-center gap-2.5 bg-white p-2.5 rounded-[10px] mb-5">
            <img
              src={checkoutData?.eventData.eventImages}
              alt="img"
            />
            <div className="flex flex-col items-start bg-white">
              <span>{checkoutData?.eventData.eventName}</span>
              <span className="checkout-page-text-title-price checkout-page-price">{checkoutData?.eventData.amount}</span>
            </div>
          </div>
          <div className="flex flex-col items-start justify-start gap-2.5 bg-white p-2.5 rounded-[10px] mb-5">
            <span className="checkout-page-text-detail">Payment Details</span>
            <div className="w-full flex flex-col items-start justify-start bg-white rounded-[10px] mb-2.5">
              {checkoutData?.tickets &&
                checkoutData.tickets.map((ticket, index) => {
                  const s = ticket.price * ticket.quantity;
                  return (
                    <div key={index} className="w-full">
                      <div className="flex w-full items-center justify-between bg-white py-1.5">
                        <span>{ticket.ticketName} x{ticket.quantity}</span>
                        <span className="text-right w-24">{s?.toLocaleString()}Đ</span>
                      </div>
                    </div>
                  );
                })}
              <div className="mt-2.5 flex w-full items-center justify-between bg-white border-t border-[#E7E9EB] pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-right w-24 font-semibold">{total?.toLocaleString()}Đ</span>
              </div>
            </div>
          </div>
          <div
            className={`flex items-start justify-center p-1.5 bg-[#408BFC] text-white no-underline rounded-[10px] cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={checkoutHandle}
          >
            {isLoading ? 'Processing...' : 'Pay Now'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;