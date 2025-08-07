import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from "../../components/Footer";
import Loader from "../../components/Loading";
export default function PaymentResultPage() {
  const [data, setData] = useState(null);
  const linkEvent = localStorage.getItem('eventCheckout');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const query = new URLSearchParams(window.location.search);
      const orderCode = query.get("orderCode");
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/payment/status/${orderCode}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
        setData(response.data);
      } catch (err) {
        console.error(err);
      }
      finally {
        setLoading(false);
      }
    };
    fetchPaymentStatus();
  }, []);

  const isSuccess = data?.transactionStatus === 'SUCCESSFULLY';

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <Loader />
    </div>
  ) : (
    <>
      <div className="max-w-2xl px-8 py-10 mx-auto bg-white border shadow-md rounded-xl mt-20">
        <div className="mb-8 border-b pb-6">
          <h3 className="text-3xl font-bold text-gray-800 text-center">
            {isSuccess ? 'PAYMENT SUCCESSFUL' : 'PAYMENT FAILED'}
          </h3>
          <p className="text-center text-gray-500 mt-2">
            {isSuccess
              ? 'Thank you for your payment! Your transaction was processed successfully.'
              : 'We\'re sorry, your payment could not be processed.'}
          </p>
        </div>
        {isSuccess && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 font-medium">Transaction Code:</span>
                <p className="text-gray-900 font-semibold">{data?.referenceCode || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Amount:</span>
                <p className="text-gray-900 font-semibold">{data?.transactionAmount ? `${data.transactionAmount} VND` : 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
              <span className="text-gray-600 font-medium">Transaction Time:</span>
              <p className="text-gray-900">{data?.transactionDate ? new Date(data.transactionDate).toLocaleString() : 'N/A'}</p>
            </div>
              <div>
                <span className="text-gray-600 font-medium">Payment Method:</span>
                <p className="text-gray-900">{data?.paymentMethod || 'N/A'}</p>
              </div>
            </div>

            <div>
              <span className="text-gray-600 font-medium">Event:</span>
              <p className="text-gray-900">{data?.transactionInfo || 'N/A'}</p>
            </div>
          </div>
        )}
        {!isSuccess && (
          <div className="space-y-6">
            <div>
              <span className="text-gray-600 font-medium">Reason for Failure:</span>
              <p className="text-red-600 italic">{data?.errorMessage || 'Unknown error. Please contact support for assistance.'}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-gray-700">
              <p className="font-medium">What to do next?</p>
              <p className="mt-1">Please verify your payment details, ensure sufficient funds, or try a different payment method. If the issue persists, contact our support team.</p>
              <p className="mt-2">
                <a href="mailto:support@eventmanagement.com" className="text-blue-600 hover:underline">support@eventmanagement.com</a> |{' '}
                <a href="tel:+84983156564" className="text-blue-600 hover:underline">+84 983156564</a>
              </p>
            </div>
          </div>
        )}
        <div className="mt-10 flex justify-center gap-6">
          <button
            onClick={() => window.location.href = linkEvent}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:from-blue-700 hover:to-blue-600 transition duration-300"
          >
            Back to Event Page
          </button>
          {isSuccess && (
            <button
              onClick={() => window.location.href = '/myinvoices'}
              className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-full shadow hover:bg-blue-50 transition duration-300"
            >
              View My Invoices
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}