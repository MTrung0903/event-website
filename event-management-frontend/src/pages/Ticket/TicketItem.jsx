import React from "react";
import { useTranslation } from "react-i18next";

const TicketItem = ({ ticket, event }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4">
      <div className="relative w-full bg-white rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-[0px_4px_10px_rgba(255,0,0,0.5)]">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1
              className="text-xl font-bold uppercase text-gray-800"
              title={event?.eventName || t("ticketItem.na")}
            >
              {event?.eventName || t("ticketItem.na")}
            </h1>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <div className="text-sm text-gray-600">
                <p className="font-semibold">
                  {new Date(event?.eventStart).toLocaleDateString() || t("ticketItem.na")}
                </p>
                <p>
                  {new Date(event?.eventStart).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) || t("ticketItem.na")}
                </p>
              </div>
              <div className="text-sm text-right text-gray-600">
                <p className="font-semibold truncate" title={event?.eventLocation?.venueName}>
                  {event?.eventLocation?.venueName || t("ticketItem.na")}
                </p>
                <p className="truncate" title={event?.eventLocation?.address}>
                  {event?.eventLocation?.address || t("ticketItem.na")}
                </p>
                <p className="truncate" title={event?.eventLocation?.city}>
                  {event?.eventLocation?.city || t("ticketItem.na")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <div className="flex flex-col items-center">
              <img
                className="w-16 h-16 object-cover mb-2"
                src={`data:image/png;base64,${ticket?.qrCodeBase64 || ""}`}
                alt={t("ticketItem.qrCodeAlt")}
              />
              <span className="text-sm font-bold text-gray-800">
                {ticket?.ticketCode || t("ticketItem.na")}
              </span>
            </div>
            <span className="text-lg font-bold text-gray-800">
              {ticket?.ticketInfo?.price ? `${ticket.ticketInfo.price} ${t("currency.vnd")}` : "0"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketItem;