import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useParams } from 'react-router-dom';
import TicketItem from "./TicketItem";
import Footer from "../../components/Footer";
import Loader from "../../components/Loading";

export default function ViewTicket() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const { orderCode } = useParams();
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    console.log(orderCode);
    const fetch = async () => {
      const token = localStorage.getItem('token');
      let userId;
      if (token) {
        try {
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          userId = decodedPayload.userId;
          console.log(userId);
        } catch (e) {
          return;
        }
      } else {
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/v1/booking/${orderCode}/tickets`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderCode]);

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <Loader />
    </div>
  ) : (
    <>
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">{t("viewTicket.title", { orderCode })}</h2>
        <div className="space-y-2">
          {data?.tickets?.map((ticket) => (
            <TicketItem key={ticket.ticketCode} ticket={ticket} event={data.event} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};