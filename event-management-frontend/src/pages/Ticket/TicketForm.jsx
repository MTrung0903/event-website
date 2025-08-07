import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const TicketForm = ({ newTicket, typeTicket, onChange, onSave, onCancel, isReadOnly, eventStart, eventEnd }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({
    ticketName: "",
    quantity: "",
    price: "",
    startTime: "",
    endTime: "",
  });

  const validateTicketName = (name) => {
    if (!name) return t("ticketForm.errors.ticketNameRequired");
    const regex = /^[a-zA-Z0-9\s]+$/;
    return regex.test(name) ? "" : t("ticketForm.errors.ticketNameInvalid");
  };

  const validateQuantity = (quantity) => {
    if (!quantity) return t("ticketForm.errors.quantityRequired");
    const num = parseInt(quantity, 10);
    return Number.isInteger(num) && num > 0 ? "" : t("ticketForm.errors.quantityInvalid");
  };

  const validatePrice = (price) => {
    if (typeTicket !== "Paid") return "";
    if (!price) return t("ticketForm.errors.priceRequired");
    const num = parseFloat(price);
    return num > 0 ? "" : t("ticketForm.errors.priceInvalid");
  };

  const validateDates = (startTime, endTime) => {
    if (!startTime) return { startTime: t("ticketForm.errors.startTimeRequired") };
    if (!endTime) return { endTime: t("ticketForm.errors.endTimeRequired") };
    const start = new Date(startTime);
    const end = new Date(endTime);
    return start < end ? {} : { endTime: t("ticketForm.errors.endTimeInvalid") };
  };

  const computeErrors = () => {
    const nameError = validateTicketName(newTicket.ticketName);
    const quantityError = validateQuantity(newTicket.quantity);
    const priceError = validatePrice(newTicket.price);
    const dateErrors = validateDates(newTicket.startTime, newTicket.endTime);

    return {
      ticketName: nameError,
      quantity: quantityError,
      price: priceError,
      startTime: dateErrors.startTime || "",
      endTime: dateErrors.endTime || "",
    };
  };

  const isFormValid = () => {
    const { ticketName, quantity, price, startTime, endTime } = computeErrors();
    return !ticketName && !quantity && !price && !startTime && !endTime;
  };

  const handleChange = (e) => {
    onChange(e);
    setErrors(computeErrors());
  };

  const handleSave = () => {
    const newErrors = computeErrors();
    setErrors(newErrors);
    if (isFormValid()) {
      onSave();
    }
  };

  useEffect(() => {
    setErrors(computeErrors());
  }, [newTicket, typeTicket]);

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    return isoDate.split("T")[0];
  };

  return (
    <div
      className="fixed top-0 right-0 h-full w-full sm:w-96 max-h-[700px] mt-[55px] bg-gray-50 border-l border-blue-400 shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0 rounded-l-xl"
    >
      <div className="p-4 sm:p-5">
        <h2 className="mb-3 text-lg font-semibold text-gray-800 sm:text-xl">
          {t("ticketForm.title")}
        </h2>
        <div className="flex mb-3 space-x-3">
          {["Paid", "Free"].map((type) => (
            <button
              key={type}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                typeTicket === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() =>
                onChange({ target: { name: "ticketType", value: type } })
              }
            >
              {t(`ticketForm.${type.toLowerCase()}Ticket`)}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 sm:text-base">
            {t("ticketForm.ticketNameLabel")} *
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg p-2 sm:p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              name="ticketName"
              disabled={isReadOnly}
              value={newTicket.ticketName}
              onChange={handleChange}
            />
            {errors.ticketName && (
              <p className="mt-1 text-xs text-red-400">{errors.ticketName}</p>
            )}
          </label>
          <label className="block text-sm font-medium text-gray-700 sm:text-base">
            {t("ticketForm.quantityLabel")} *
            <input
              type="number"
              className="w-full border border-gray-200 rounded-lg p-2 sm:p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              name="quantity"
              value={newTicket.quantity}
              disabled={isReadOnly}
              onChange={handleChange}
              min="1"
              step="1"
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-400">{errors.quantity}</p>
            )}
          </label>
          {typeTicket === "Paid" && (
            <label className="block text-sm font-medium text-gray-700 sm:text-base">
              {t("ticketForm.priceLabel")} *
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-2.5 rounded-l-lg border border-r-0 border-gray-200 text-gray-700 text-sm">
                  {t("currency.vnd")}
                </span>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-r-lg p-2 sm:p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  name="price"
                  value={newTicket.price}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-xs text-red-400">{errors.price}</p>
              )}
            </label>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-gray-700 sm:text-base">
              {t("ticketForm.startTimeLabel")} *
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg p-2 sm:p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                name="startTime"
                value={newTicket.startTime}
                disabled={isReadOnly}
                onChange={handleChange}
                max={formatDateForInput(eventStart)}
              />
              {errors.startTime && (
                <p className="mt-1 text-xs text-red-400">{errors.startTime}</p>
              )}
            </label>
            <label className="block text-sm font-medium text-gray-700 sm:text-base">
              {t("ticketForm.endTimeLabel")} *
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg p-2 sm:p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                name="endTime"
                value={newTicket.endTime}
                disabled={isReadOnly}
                onChange={handleChange}
                max={formatDateForInput(eventEnd)}
              />
              {errors.endTime && (
                <p className="mt-1 text-xs text-red-400">{errors.endTime}</p>
              )}
            </label>
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-3">
          <button
            className="px-4 py-2 text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200"
            onClick={onCancel}
          >
            {t("ticketForm.cancel")}
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isFormValid()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleSave}
            disabled={!isFormValid()}
          >
            {t("ticketForm.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketForm;