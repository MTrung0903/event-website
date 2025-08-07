import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TicketForm from "./TicketForm";
import Swal from "sweetalert2";
import { CiTrash } from "react-icons/ci";
import SeatingLayoutEditor from "../Event/SeatingLayoutEditor";

const TicketOverview = ({
  tickets,
  seatingMapImage,
  seatingMapImageVersions,
  onAddTicket,
  onSaveAll,
  onEditTicket,
  onDeleteTicket,
  onOpenSeatingEditor,
  onSelectVersion,
}) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleSelectType = (type) => {
    onAddTicket(type);
    setDropdownOpen(false);
  };

  const hasFreeTicket = tickets.some((ticket) => ticket.ticketType === "Free");

  const ticketOptions = [
    { icon: "ticket-alt", color: "blue", label: "Paid" },
    ...(hasFreeTicket
      ? []
      : [{ icon: "scissors", color: "purple", label: "Free" }]),
  ];

  return (
    <div className="flex flex-col p-4 mx-auto max-w-7xl min-h-[calc(100vh-4rem)]">
      <div className="flex flex-1">
        <div className="w-2/3 pr-4">
          <h3 className="mt-6 text-lg font-semibold">Thêm vé</h3>
          {tickets.map((ticket, index) => (
            <div
              key={ticket.ticketId || index}
              className="mt-2 bg-white rounded-[5px] p-4 border border-gray-400"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="pb-2 text-lg font-semibold text-gray-900">
                    {ticket.ticketName}
                  </h2>
                  <div className="flex items-center pb-2 space-x-4">
                    <span className="text-gray-500">
                      {t("addTickets.sold", {
                        sold: ticket.sold || 0,
                        quantity: ticket.quantity,
                      })}
                    </span>
                    <span className="text-gray-500">
                      {ticket.ticketType === "Paid"
                        ? t("addTickets.ticketPrice", { price: ticket.price })
                        : t("addTickets.freeTicket")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 text-sm text-gray-500 border-t border-t-gray-500">
                  <div className="flex items-center">
                    <span className="mr-2 text-green-500">•</span>
                    <span>{t("addTickets.onSale")}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {t("addTickets.endsAt", { endTime: ticket.endTime })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i
                      className="text-base cursor-pointer fa-solid fa-pen-to-square hover:text-blue-600"
                      onClick={() => onEditTicket(ticket)}
                    ></i>
                    <CiTrash
                      className="text-xl text-gray-500 cursor-pointer hover:text-red-600"
                      onClick={() => onDeleteTicket(index, ticket)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {seatingMapImage && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Bố cục chỗ ngồi</h3>
              <img
                src={seatingMapImage}
                alt="Bố cục chỗ ngồi"
                className="h-auto max-w-full rounded-lg shadow-md"
              />
            </div>
          )}
          {seatingMapImageVersions && seatingMapImageVersions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Phiên bản bố cục trước</h3>
              <select
                onChange={(e) => {
                  const selected = seatingMapImageVersions.find(
                    (v) => v.image === e.target.value
                  );
                  onSelectVersion(selected ? selected : { image: e.target.value });
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Chọn phiên bản</option>
                {seatingMapImageVersions.map((version, index) => (
                  <option key={index} value={version.image}>
                    Phiên bản {index + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
          {tickets.length > 0 && (
            <button
              onClick={onOpenSeatingEditor}
              className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-lg"
            >
              Tạo bố cục chỗ ngồi
            </button>
          )}
        </div>
        <div className="w-1/3">
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-between px-4 py-2 text-white bg-orange-600 rounded-lg"
            >
              {t("addTickets.addTicketButton")}{" "}
              <i className="ml-2 fas fa-caret-down"></i>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 z-50 w-64 p-4 mt-2 bg-white rounded-lg shadow-lg top-full">
                <div className="space-y-4">
                  {ticketOptions.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSelectType(item.label)}
                    >
                      <div className={`bg-${item.color}-100 p-2 rounded-lg`}>
                        <i
                          className={`fas fa-${item.icon} text-${item.color}-600`}
                        ></i>
                      </div>
                      <span>
                        {item.label === "Paid"
                          ? t("addTickets.paidTicket")
                          : t("addTickets.freeTicket")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          className="px-6 py-2 text-white bg-orange-600 rounded-lg"
          onClick={onSaveAll}
        >
          {t("addTickets.saveAndContinue")}
        </button>
      </div>
    </div>
  );
};

const TicketTypeSelector = ({ onSelectType }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {["Paid", "Free"].map((type, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 rounded-[6px] shadow-sm cursor-pointer w-2/4 border border-gray-300"
          onClick={() => onSelectType(type)}
        >
          <div className="flex items-center">
            {type === "Paid" ? (
              <svg
                width="63"
                height="63"
                viewBox="0 0 63 63"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="63"
                  height="63"
                  rx="8"
                  fill="#3659E3"
                  fillOpacity="0.08"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M34.65 14.175C34.65 14.175 34.65 19.6875 29.925 19.6875C25.2 19.6875 25.2 14.175 25.2 14.175H17.325V45.675H25.2C25.1747 44.4468 25.6384 43.259 26.4891 42.3728C27.3399 41.4866 28.5078 40.9748 29.736 40.95H29.925C31.1532 40.9247 32.341 41.3884 33.2272 42.2391C34.1134 43.0899 34.6252 44.2578 34.65 45.486V45.675H42.525V14.175H34.65ZM44.1 17.325V47.25H37.8V48.825H45.675V17.325H44.1ZM26.9325 47.2503C27.4409 45.3611 28.7707 43.8 30.555 42.9978C31.1169 43.233 31.6062 43.6135 31.9725 44.1003C29.8673 44.7219 28.4037 46.6309 28.35 48.8253H20.475V47.2503H26.9325ZM25.2 30.7125V29.1375H22.05V30.7125H25.2ZM28.35 30.7125V29.1375H31.5V30.7125H28.35ZM37.8 29.1375H34.65V30.7125H37.8V29.1375ZM36.225 44.1H40.95V15.75H36.225C35.595 18.4275 33.8625 21.2625 29.925 21.2625C25.9875 21.2625 24.255 18.4275 23.625 15.75H18.9V44.1H23.625C24.1956 41.1381 26.9218 39.0935 29.925 39.375C32.9282 39.0935 35.6543 41.1381 36.225 44.1Z"
                  fill="#6898F7"
                />
              </svg>
            ) : (
              <svg
                width="63"
                height="63"
                viewBox="0 0 63 63"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="63"
                  height="63"
                  rx="6.38"
                  fill="#F2E7FE"
                  fillOpacity="0.8"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M36.0746 26.775H39.5489C39.4388 24.066 36.3104 21.5775 33.0248 20.7743V17.325H29.8807V20.727C29.0476 20.916 28.1672 21.1995 27.4598 21.5775L29.7707 23.8928C30.4152 23.625 31.2013 23.4675 32.1445 23.4675C34.9428 23.4675 35.9803 24.8063 36.0746 26.775ZM18.8764 20.9947L24.2842 26.4127C24.2842 29.6887 26.7366 31.4685 30.4309 32.571L35.9488 38.0992C35.4143 38.8552 34.2982 39.5325 32.1445 39.5325C28.906 39.5325 27.6327 38.0835 27.4598 36.225H24.0012C24.1899 39.6742 26.8624 41.6115 29.8797 42.2712V45.6759C32.1447 39.4325C28 39.4545 30.4309 32.43C35.9428 35.0996 38.4312 37.4224 41.842 40.4412L34.0746 41.7845L21.1088 18.7582L18.8766 20.9948Z"
                  fill="#9374E7"
                />
              </svg>
            )}
            <div className="ml-4">
              <h2 className="text-lg font-semibold">
                {type === "Paid"
                  ? t("addTickets.paidTicket")
                  : t("addTickets.freeTicket")}
              </h2>
              <p className="text-gray-600">
                {type === "Paid"
                  ? t("addTickets.paidTicketDescription")
                  : t("addTickets.freeTicketDescription")}
              </p>
            </div>
          </div>
          <i className="text-gray-400 fas fa-chevron-right"></i>
        </div>
      ))}
      <div className="absolute flex items-center justify-end w-2/4 p-4 rounded-lg cursor-pointer bottom-20 right-4">
        <button className="px-6 py-2 text-white bg-orange-600 rounded-lg">
          {t("addTickets.saveAndContinue")}
        </button>
      </div>
    </div>
  );
};

const formatDateForInput = (isoDate) => {
  if (!isoDate) return "";
  return isoDate.split("T")[0];
};

const AddTicket = ({
  ticketData,
  onTicketsUpdate,
  eventId,
  eventStart,
  eventEnd,
  onNext,
  isReadOnly,
  venueType,
  seatingLayout,
  seatingMapImage,
  seatingMapImageVersions,
}) => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState(ticketData || []);
  const [localSeatingMapImage, setSeatingMapImage] = useState(seatingMapImage);
  const [localSeatingMapImageVersions, setSeatingMapImageVersions] = useState(
    (seatingMapImageVersions || []).map((v) => ({ image: v, layout: null }))
  );
  const [localSeatingLayout, setLocalSeatingLayout] = useState(seatingLayout);
const [newTicket, setNewTicket] = useState({
  eventId: eventId || "",
  ticketId: null, // Sử dụng null thay vì ticket-<timestamp>
  ticketName: "",
  ticketType: "Paid",
  price: "",
  quantity: "",
  startTime: "",
  endTime: "",
  isLocal: true,
});
  const [typeTicket, setTypeTicket] = useState("Paid");
  const [showForm, setShowForm] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  const [editingTicket, setEditingTicket] = useState(null);
  const [isSeatingEditorOpen, setIsSeatingEditorOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const formattedTickets = (ticketData || []).map((ticket) => ({
      ...ticket,
      startTime: formatDateForInput(ticket.startTime),
      endTime: formatDateForInput(ticket.endTime),
      isLocal: ticket.isLocal || false,
      ticketId: ticket.ticketId || `ticket-${Date.now()}`,
    }));
    setTickets(formattedTickets);
    setShowOverview(formattedTickets.length > 0);
  }, [ticketData]);

  

  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    if (editingTicket) {
      setEditingTicket((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewTicket((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

const handleTicketClick = (type) => {
  if (isReadOnly) return;
  setTypeTicket(type);
  setNewTicket((prev) => ({
    ...prev,
    ticketType: type,
    ticketId: null, // Sử dụng null
    isLocal: true,
  }));
  setShowForm(true);
  setEditingTicket(null);
};

  useEffect(() => {
    setNewTicket((prev) => ({ ...prev, ticketType: typeTicket }));
  }, [typeTicket]);

  const validateTicketDates = (ticket) => {
    if (!eventStart || !eventEnd) {
      return {
        isValid: false,
        message: t("addTickets.errors.eventDatesNotSet"),
      };
    }

    const ticketStart = new Date(ticket.startTime);
    const ticketEnd = new Date(ticket.endTime);
    const eventStartDate = new Date(eventStart);
    const eventEndDate = new Date(eventEnd);

    if (ticketStart > eventStartDate) {
      return {
        isValid: false,
        message: t("addTickets.errors.invalidStartDate"),
      };
    }

    if (ticketStart > eventEndDate) {
      return {
        isValid: false,
        message: t("addTickets.errors.startAfterEventEnd"),
      };
    }

    if (ticketEnd > eventStartDate) {
      return {
        isValid: false,
        message: t("addTickets.errors.endAfterEventStart"),
      };
    }

    return { isValid: true, message: "" };
  };

  const handleSaveTicket = () => {
    if (isReadOnly) return;
    if (
      !newTicket.ticketName ||
      !newTicket.quantity ||
      !newTicket.startTime ||
      !newTicket.endTime
    ) {
      Swal.fire({
        icon: "error",
        title: t("addTickets.errors.title"),
        text: t("addTickets.errors.requiredFields"),
      });
      return;
    }
    if (newTicket.ticketType === "Paid" && !newTicket.price) {
      Swal.fire({
        icon: "error",
        title: t("addTickets.errors.title"),
        text: t("addTickets.errors.priceRequired"),
      });
      return;
    }

    const dateValidation = validateTicketDates(newTicket);
    if (!dateValidation.isValid) {
      Swal.fire({
        icon: "error",
        title: t("addTickets.errors.title"),
        text: dateValidation.message,
      });
      return;
    }

    const updatedTickets = [...tickets, { ...newTicket, isLocal: true }];
    setTickets(updatedTickets);
    onTicketsUpdate(updatedTickets, {
      image: localSeatingMapImage,
      versions: localSeatingMapImageVersions,
      layout: JSON.stringify(localSeatingLayout),
    });
    setNewTicket({
      eventId: eventId || "",
      ticketId: `ticket-${Date.now()}`,
      ticketName: "",
      ticketType: "Paid",
      price: "",
      quantity: "",
      startTime: "",
      endTime: "",
      isLocal: true,
    });
    setShowForm(false);
    setShowOverview(true);
    setIsSeatingEditorOpen(true);
  };

  const handleEditTicket = (ticket) => {
    if (isReadOnly) return;
    setEditingTicket({
      ...ticket,
      startTime: formatDateForInput(ticket.startTime),
      endTime: formatDateForInput(ticket.endTime),
    });
    setTypeTicket(ticket.ticketType);
    setShowForm(true);
  };

  const handleUpdateTicket = () => {
    if (
      !editingTicket.ticketName ||
      !editingTicket.quantity ||
      !editingTicket.startTime ||
      !editingTicket.endTime
    ) {
      Swal.fire({
        icon: "error",
        title: t("addTickets.errors.title"),
        text: t("addTickets.errors.requiredFields"),
      });
      return;
    }
    if (editingTicket.ticketType === "Paid" && !editingTicket.price) {
      Swal.fire({
        icon: "error",
        title: t("addTickets.errors.title"),
        text: t("addTickets.errors.priceRequired"),
      });
      return;
    }
    if (
      editingTicket.sold > 0 &&
      editingTicket.price !==
        tickets.find((t) => t.ticketId === editingTicket.ticketId)?.price
    ) {
      Swal.fire({
        icon: "warning",
        title: t("addTickets.errors.ticketSoldWarningTitle"),
        text: t("addTickets.errors.ticketSoldWarning"),
        showCancelButton: true,
        confirmButtonText: t("addTickets.confirm"),
        cancelButtonText: t("addTickets.cancel"),
      }).then((result) => {
        if (!result.isConfirmed) return;
        updateTicket();
      });
    } else {
      updateTicket();
    }
  };

  const updateTicket = () => {
    const dateValidation = validateTicketDates(editingTicket);
    if (!dateValidation.isValid) {
      Swal.fire({
        icon: "error",
        title: t("addTickets.errors.title"),
        text: dateValidation.message,
      });
      return;
    }

    const updatedTickets = tickets.map((ticket) =>
      ticket.ticketId === editingTicket.ticketId ? editingTicket : ticket
    );
    setTickets(updatedTickets);
    onTicketsUpdate(updatedTickets, {
      image: localSeatingMapImage,
      versions: localSeatingMapImageVersions,
      layout: JSON.stringify(localSeatingLayout),
    });
    setEditingTicket(null);
    setShowForm(false);
    setIsSeatingEditorOpen(true);
  };

  const handleDeleteTicket = (index, ticket) => {
    if (isReadOnly) return;
    Swal.fire({
      icon: "warning",
      title: t("addTickets.errors.confirmDeletion"),
      text: t("addTickets.errors.deleteConfirmation"),
      showCancelButton: true,
      confirmButtonText: t("addTickets.delete"),
      cancelButtonText: t("addTickets.cancel"),
    }).then((result) => {
      if (!result.isConfirmed) return;
      const updatedTickets = tickets.filter((_, i) => i !== index);
      setTickets(updatedTickets);
      onTicketsUpdate(updatedTickets, {
        image: localSeatingMapImage,
        versions: localSeatingMapImageVersions,
        layout: JSON.stringify(localSeatingLayout),
      });
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Xóa thành công",
      });
    });
  };

  const saveTicketsToDatabase = () => {
    if (tickets.length === 0) {
      Swal.fire({
        icon: "warning",
        title: t("addTickets.errors.title"),
        text: t("addTickets.errors.noTicketsToSave"),
      });
      return;
    }
    onTicketsUpdate(tickets, {
      image: localSeatingMapImage,
      versions: localSeatingMapImageVersions,
      layout: JSON.stringify(localSeatingLayout),
    });
    if (onNext) onNext();
  };

  const handleSeatingLayoutSave = (data) => {
    const { image, layout } = data;
    try {
      setSeatingMapImage(image);
      setLocalSeatingLayout(layout);
      setSeatingMapImageVersions((prev) => [
        ...prev,
        { image, layout: JSON.stringify(layout) },
      ]);
      onTicketsUpdate(tickets, {
        image,
        versions: [...localSeatingMapImageVersions, { image, layout: JSON.stringify(layout) }],
        layout: JSON.stringify(layout),
      });
      setIsSeatingEditorOpen(false);
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Bố cục chỗ ngồi đã được lưu.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể lưu bố cục. Vui lòng thử lại.",
      });
    }
  };

  const handleSelectVersion = (version) => {
    setSeatingMapImage(version.image);
    setLocalSeatingLayout(version.layout ? JSON.parse(version.layout) : null);
    onTicketsUpdate(tickets, {
      image: version.image,
      versions: localSeatingMapImageVersions,
      layout: version.layout,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50">
      <main className="flex-1 min-h-screen p-6">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {t("addTickets.title")}
        </h1>
        <p className="mb-6 text-gray-600">{t("addTickets.description")}</p>
        {!showOverview && tickets.length === 0 ? (
          <TicketTypeSelector onSelectType={handleTicketClick} />
        ) : (
          <TicketOverview
            tickets={tickets}
            seatingMapImage={localSeatingMapImage}
            seatingMapImageVersions={localSeatingMapImageVersions}
            onAddTicket={handleTicketClick}
            onSaveAll={saveTicketsToDatabase}
            onEditTicket={handleEditTicket}
            onDeleteTicket={handleDeleteTicket}
            onOpenSeatingEditor={() => setIsSeatingEditorOpen(true)}
            onSelectVersion={handleSelectVersion}
          />
        )}
      </main>
      {showForm && (
        <TicketForm
          newTicket={
            editingTicket
              ? {
                  ...editingTicket,
                  startTime: formatDateForInput(editingTicket.startTime),
                  endTime: formatDateForInput(editingTicket.endTime),
                }
              : newTicket
          }
          typeTicket={typeTicket}
          onChange={handleChange}
          onSave={editingTicket ? handleUpdateTicket : handleSaveTicket}
          onCancel={() => {
            setShowForm(false);
            setEditingTicket(null);
          }}
          isReadOnly={isReadOnly}
        />
      )}
      <SeatingLayoutEditor
        isOpen={isSeatingEditorOpen}
        onClose={() => setIsSeatingEditorOpen(false)}
        venueType={venueType || "indoor"}
        onSave={handleSeatingLayoutSave}
        availableTickets={tickets.map((ticket) => ({
          ...ticket,
          ticketId: ticket.ticketId, // Đảm bảo ticketId được giữ nguyên
        }))}
        seatingLayout={localSeatingLayout}
      />
    </div>
  );
};

export default AddTicket;