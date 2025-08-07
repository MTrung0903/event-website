import React, { useState, useEffect } from "react";
import EventForm from "./EventForm";
import AddTicket from "../Ticket/AddTicket";
import EventPublishing from "./EventPublishing";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../components/Loading";
import { useTranslation } from 'react-i18next';
import Footer from "../../components/Footer";

const EditEventPage = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const eventId = location.state?.eventId || undefined;
  const token = localStorage.getItem("token");
  const [selectedStep, setSelectedStep] = useState("build");

  const [event, setEvent] = useState({
    eventName: "",
    eventDesc: "",
    eventType: "",
    eventHost: "",
    eventStatus: "",
    eventStart: "",
    eventEnd: "",
    eventLocation: {
      date: "",
      startTime: "",
      endTime: "",
      locationType: "venue",
      venueName: "",
      address: "",
      city: "",
    },
    tags: [],
    eventVisibility: "public",
    publishTime: new Date().toISOString(),
    refunds: "yes",
    validityDays: 7,
    uploadedImages: [],
    overviewContent: { text: "", media: [] },
    tickets: [],
    segment: [],
    seatingMapImage: null,
    seatingLayout: null,
    seatingMapImageVersions: [],
  });

  useEffect(() => {
    if (eventId) {
      fetchEventData(eventId);
    }
  }, [eventId, t]);

  const isReadOnly = event.eventStatus === "Complete";

  const fetchEventData = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8080/api/events/edit/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(t("editEventPage.errors.fetchFailed", { message: `${response.status} - ${errorText}` }));
      }
      const data = await response.json();

      if (!data || !data.event) {
        throw new Error(t("editEventPage.errors.invalidEventData"));
      }

      const seatingLayout = data.event.seatingLayout ? JSON.parse(data.event.seatingLayout) : null;
      if (seatingLayout && seatingLayout.seatingAreas && data.ticket) {
        seatingLayout.seatingAreas = seatingLayout.seatingAreas.map((area) => {
          const matchingTicket = data.ticket.find((ticket) => ticket.ticketId === parseInt(area.ticketId?.replace("ticket-", "")));
          return {
            ...area,
            ticketId: matchingTicket ? `ticket-${matchingTicket.ticketId}` : area.ticketId,
          };
        });
      }

      const transformedEvent = {
        eventName: data.event.eventName || "",
        eventDesc: data.event.eventDesc || "",
        eventType: String(data.event.eventTypeId || ""),
        eventHost: data.event.eventHost || "",
        eventStatus: data.event.eventStatus || "",
        eventStart: data.event.eventStart || "",
        eventEnd: data.event.eventEnd || "",
        eventLocation: {
          date: data.event.eventStart?.split("T")[0] || "",
          startTime: data.event.eventStart?.split("T")[1]?.slice(0, 5) || "",
          endTime: data.event.eventEnd?.split("T")[1]?.slice(0, 5) || "",
          locationType: "venue",
          venueName: data.event.eventLocation?.venueName || "",
          venueSlug: data.event.eventLocation?.venueSlug || "",
          address: data.event.eventLocation?.address || "",
          city: data.event.eventLocation?.city || "",
        },
        tags: data.event.tags ? data.event.tags.split("|") : [],
        eventVisibility: data.event.eventVisibility || "public",
        publishTime: data.event.publishTime || new Date().toISOString(),
        refunds: data.event.refunds || "yes",
        validityDays: data.event.validityDays || 7,
        uploadedImages: data.event.eventImages || [],
        overviewContent: {
          text: data.event.textContent || "",
          media: data.event.mediaContent?.map((url) => ({ type: "image", url })) || [],
        },
        tickets: data.ticket?.map((ticket) => ({
          ticketId: ticket.ticketId || null,
          ticketName: ticket.ticketName || "",
          ticketType: ticket.ticketType || "",
          price: ticket.price || 0,
          quantity: ticket.quantity || 0,
          startTime: ticket.startTime || "",
          endTime: ticket.endTime || "",
          sold: ticket.sold || 0,
        })) || [],
        segment: data.segment?.map((seg) => ({
          segmentId: seg.segmentId || null,
          segmentTitle: seg.segmentTitle || "",
          speaker: seg.speaker
            ? {
              speakerId: seg.speaker.speakerId || null,
              speakerImage: seg.speaker.speakerImage || "",
              speakerName: seg.speaker.speakerName || "",
              speakerDesc: seg.speaker.speakerDesc || "",
            }
            : null,
          segmentDesc: seg.segmentDesc || "",
          startTime: seg.startTime?.split("T")[1]?.slice(0, 5) || "",
          endTime: seg.endTime?.split("T")[1]?.slice(0, 5) || "",
        })) || [],
        seatingMapImage: data.event.seatingMapImage || null,
        seatingLayout,
        seatingMapImageVersions: data.event.seatingMapImageVersions || [],
      };

      console.log("Fetched event data:", transformedEvent);
      setEvent(transformedEvent);
    } catch (error) {
      console.error("Error fetching event:", error);
      Swal.fire({
        icon: "error",
        title: t("editEventPage.errors.fetchFailed", { message: "" }),
        text: t("editEventPage.errors.fetchFailed", { message: error.message }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFilesToCloudinary = async (files) => {
    if (!files || (Array.isArray(files) && files.length === 0)) return [];

    const uploadedIds = [];
    const fileList = Array.isArray(files)
      ? files.map((item) => (typeof item === "object" && item.url ? item.url : item))
      : [typeof files === "object" && files.url ? files.url : files];

    for (const file of fileList) {
      try {
        if (typeof file === "string" && file.startsWith("http")) {
          const publicId = file.split("/").pop().split(".")[0];
          uploadedIds.push(publicId);
          continue;
        }

        let blob;
        if (typeof file === "string" && (file.startsWith("blob:") || file.startsWith("data:"))) {
          const response = await fetch(file);
          if (!response.ok) throw new Error(t("createEventPage.errors.uploadFailed", { message: `Failed to fetch blob: ${file}` }));
          blob = await response.blob();
        } else if (file instanceof File || file instanceof Blob) {
          blob = file;
        } else {
          Swal.fire({
            icon: "warning",
            title: t("createEventPage.errors.invalidFile"),
            text: t("createEventPage.errors.invalidFile"),
          });
          continue;
        }

        if (blob.size > 10 * 1024 * 1024) {
          Swal.fire({
            icon: "warning",
            title: t("createEventPage.errors.fileSizeTooLarge"),
            text: t("createEventPage.errors.fileSizeTooLarge"),
          });
          continue;
        }

        const formData = new FormData();
        formData.append("file", blob, "cropped_image.jpg");

        const response = await fetch("http://localhost:8080/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(t("createEventPage.errors.uploadFailed", { message: errorText }));
        }

        const publicId = await response.text();
        if (!publicId) throw new Error(t("createEventPage.errors.noPublicId"));
        uploadedIds.push(publicId);
      } catch (error) {
        console.error("Lỗi tải lên:", error);
        Swal.fire({
          icon: "error",
          title: t("createEventPage.errors.uploadFailed", { message: "" }),
          text: t("createEventPage.errors.uploadFailed", { message: error.message }),
        });
      }
    }

    return uploadedIds.filter((id) => id !== null);
  };

  const handleEdit = async (updatedEvent) => {
    if (isReadOnly) {
      Swal.fire({
        icon: "info",
        title: t('editEventPage.readOnlyMessage'),
        text: t('editEventPage.readOnlyMessage'),
      });
      return;
    }
    setIsLoading(true);
    try {
      const isFile = (item) =>
        item instanceof File ||
        item instanceof Blob ||
        (typeof item === "string" && (item.startsWith("blob:") || item.startsWith("data:")));

      const existingImageIds =
        updatedEvent.uploadedImages?.filter((item) => typeof item === "string" && item.startsWith("http")) || [];
      const newImages = updatedEvent.uploadedImages?.filter(isFile) || [];
      const newImageIds = newImages.length > 0 ? await uploadFilesToCloudinary(newImages) : [];
      const eventImages = [...existingImageIds, ...newImageIds];

      const existingMediaIds =
        updatedEvent.overviewContent?.media
          ?.filter((item) => typeof item === "object" && item.url && item.url.startsWith("http"))
          .map((item) => item.url) || [];
      const newMedia = updatedEvent.overviewContent?.media?.filter((item) =>
        isFile(item.url)
      ) || [];
      const newMediaIds = newMedia.length > 0
        ? await uploadFilesToCloudinary(newMedia.map((item) => item.url))
        : [];
      const mediaContent = [...existingImageIds, ...newMediaIds];

      const ticketData = updatedEvent.tickets?.length > 0
        ? updatedEvent.tickets.map((ticket) => ({
            ticketId: ticket.ticketId && typeof ticket.ticketId === "string" && !ticket.ticketId.startsWith("ticket-")
              ? parseInt(ticket.ticketId, 10) || null
              : null,
            ticketName: ticket.ticketName || "",
            ticketType: ticket.ticketType || "Paid",
            price: parseFloat(ticket.price) || 0,
            quantity: parseInt(ticket.quantity, 10) || 0,
            startTime: ticket.startTime || "",
            endTime: ticket.endTime || "",
            sold: parseInt(ticket.sold, 10) || 0,
          }))
        : [];

      const segmentData = [];
      if (updatedEvent.segment?.length > 0) {
        for (const segment of updatedEvent.segment) {
          const uploadedSpeakerImage = segment?.speaker?.speakerImage
            ? (await uploadFilesToCloudinary([segment.speaker.speakerImage]))[0]
            : segment.speaker?.speakerImage || null;

          segmentData.push({
            segmentId: segment.segmentId || null,
            segmentTitle: segment.segmentTitle || "",
            speaker: segment.speaker
              ? {
                  speakerId: segment.speaker.speakerId || null,
                  speakerImage: uploadedSpeakerImage || "",
                  speakerName: segment.speaker.speakerName || "",
                  speakerEmail: segment.speaker.speakerEmail || null,
                  speakerTitle: segment.speaker.speakerTitle || null,
                  speakerPhone: segment.speaker.speakerPhone || null,
                  speakerAddress: segment.speaker.speakerAddress || null,
                  speakerDesc: segment.speaker.speakerDesc || "",
                }
              : null,
            eventID: eventId || null,
            segmentDesc: segment.segmentDesc || "",
            startTime: segment.startTime
              ? `${updatedEvent.eventLocation.date}T${segment.startTime}:00`
              : "2025-04-05T12:10:00.000+00:00",
            endTime: segment.endTime
              ? `${updatedEvent.eventLocation.date}T${segment.endTime}:00`
              : "2025-04-05T17:06:00.000+00:00",
          });
        }
      }

      let seatingMapImageId = null;
      if (updatedEvent.seatingMapImage) {
        if (updatedEvent.seatingMapImage.startsWith("http")) {
          seatingMapImageId = updatedEvent.seatingMapImage.split("/").pop().split(".")[0];
        } else if (isFile(updatedEvent.seatingMapImage)) {
          const imageIds = await uploadFilesToCloudinary([updatedEvent.seatingMapImage]);
          seatingMapImageId = imageIds[0] || null;
        }
      }

      const seatingMapImageVersionIds = updatedEvent.seatingMapImageVersions
        ? await Promise.all(
            updatedEvent.seatingMapImageVersions.map(async (version) => {
              if (typeof version.image === "string" && version.image.startsWith("http")) {
                return version.image.split("/").pop().split(".")[0];
              } else if (isFile(version.image)) {
                const versionIds = await uploadFilesToCloudinary([version.image]);
                return versionIds[0] || null;
              }
              return null;
            })
          ).then((ids) => ids.filter((id) => id !== null))
        : [];

      let updatedSeatingLayout = updatedEvent.seatingLayout;
      if (updatedSeatingLayout && updatedSeatingLayout.seatingAreas) {
        updatedSeatingLayout.seatingAreas = updatedSeatingLayout.seatingAreas.map((area) => {
          const ticketIdStr = typeof area.ticketId === "string" ? area.ticketId.replace("ticket-", "") : null;
          const ticketIdNum = ticketIdStr && !isNaN(parseInt(ticketIdStr, 10)) ? parseInt(ticketIdStr, 10) : null;
          const matchingTicket = ticketData.find((ticket) =>
            ticket.ticketName === area.name &&
            ticket.price === area.price &&
            ticket.quantity === area.capacity
          );
          return {
            ...area,
            ticketId: matchingTicket ? `ticket-${matchingTicket.ticketId || 'new-' + area.id}` : null,
            x: area.x || 50,
            y: area.y || 150,
            width: area.width || 200,
            height: area.height || 200,
          };
        });
      }

      const payload = {
        event: {
          eventId: eventId || null,
          eventName: updatedEvent.eventName || "",
          eventDesc: updatedEvent.eventDesc || "",
          eventTypeId: updatedEvent.eventType || "",
          eventHost: updatedEvent.eventHost || "OFFICE",
          eventStatus: updatedEvent.eventStatus || "public",
          eventStart:
            updatedEvent.eventLocation.date && updatedEvent.eventLocation.startTime
              ? `${updatedEvent.eventLocation.date}T${updatedEvent.eventLocation.startTime}:00`
              : "2025-04-05T12:10:00",
          eventEnd:
            updatedEvent.eventLocation.date && updatedEvent.eventLocation.endTime
              ? `${updatedEvent.eventLocation.date}T${updatedEvent.eventLocation.endTime}:00`
              : "2025-04-05T14:06:00",
          eventLocation: {
            date: updatedEvent.eventStart.split("T")[0],
            startTime: updatedEvent.eventStart.split("T")[1]?.slice(0, 5),
            endTime: updatedEvent.eventEnd.split("T")[1]?.slice(0, 5),
            locationType: "venue",
            venueName: updatedEvent.eventLocation.venueName || "",
            venueSlug: updatedEvent.eventLocation.venueSlug || "",
            address: updatedEvent.eventLocation.address || "",
            city: updatedEvent.eventLocation.city || "",
          },
          eventVisibility: updatedEvent.eventVisibility || "public",
          publishTime: updatedEvent.publishTime || new Date().toISOString(),
          refunds: updatedEvent.refunds || "yes",
          validityDays: updatedEvent.validityDays || 7,
          eventImages: eventImages,
          textContent: updatedEvent.overviewContent?.text || "",
          mediaContent: mediaContent,
          tags: updatedEvent.tags?.join("|") || "",
          seatingMapImage: seatingMapImageId,
          seatingLayout: updatedSeatingLayout ? JSON.stringify(updatedSeatingLayout) : null,
          seatingMapImageVersions: seatingMapImageVersionIds,
        },
        ticket: ticketData,
        segment: segmentData,
      };

      console.log("Submitting payload:", payload);

      const response = await fetch(`http://localhost:8080/api/events/edit`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(t("editEventPage.errors.editFailed", { message: errorText }));
      }

      Swal.fire({
        icon: "success",
        title: t("editEventPage.successEdit.title"),
        text: t("editEventPage.successEdit.text"),
      });
      setEvent(updatedEvent);
    } catch (error) {
      console.error("Edit error:", error);
      Swal.fire({
        icon: "error",
        title: t("editEventPage.errors.editFailed", { message: "" }),
        text: t("editEventPage.errors.editFailed", { message: error.message }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketsUpdate = (updatedTickets, { image, versions, layout }) => {
    if (isReadOnly) return;
    setEvent((prevEvent) => ({
      ...prevEvent,
      tickets: updatedTickets,
      seatingMapImage: image || prevEvent.seatingMapImage,
      seatingLayout: layout ? JSON.parse(layout) : prevEvent.seatingLayout,
      seatingMapImageVersions: versions || prevEvent.seatingMapImageVersions,
    }));
  };

  const renderStepComponent = () => {
    switch (selectedStep) {
      case "build":
        return (
          <EventForm
            event={event}
            setEvent={setEvent}
            onNext={() => setSelectedStep("tickets")}
            isReadOnly={isReadOnly}
            t={t}
          />
        );
      case "tickets":
        return (
          <AddTicket
            ticketData={event.tickets}
            onTicketsUpdate={handleTicketsUpdate}
            onNext={() => setSelectedStep("publish")}
            isReadOnly={isReadOnly}
            eventStart={event.eventStart}
            eventEnd={event.eventEnd}
            seatingMapImage={event.seatingMapImage}
            seatingLayout={event.seatingLayout}
            seatingMapImageVersions={event.seatingMapImageVersions}
            venueType="venue"
            t={t}
          />
        );
      case "publish":
        return (
          <EventPublishing
            event={event}
            setEvent={setEvent}
            onPublish={() => handleEdit(event)}
            isReadOnly={isReadOnly}
            t={t}
          />
        );
      default:
        return (
          <EventForm
            event={event}
            setEvent={setEvent}
            t={t}
          />
        );
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col items-start justify-center min-h-screen p-6 space-y-4 bg-gray-50 lg:flex-row lg:items-stretch lg:space-y-0 lg:space-x-2">
          <aside className="w-full p-4 bg-white shadow-sm lg:w-1/4">
            <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-semibold">
                {event.eventName || t("editEventPage.noTitle")}
              </h2>
              <div className="flex items-center mt-2 text-gray-500">
                <i className="mr-2 far fa-calendar-alt"></i>
                <span>
                  {event.eventLocation.date && event.eventLocation.startTime
                    ? `${event.eventLocation.date}, ${event.eventLocation.startTime}`
                    : t("editEventPage.noDateTime")}
                </span>
              </div>
              {isReadOnly && (
                <p className="mt-2 text-red-500">
                  {t("editEventPage.readOnlyMessage")}
                </p>
              )}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("editEventPage.stepsTitle")}</h3>
            <div className="space-y-2">
              {["build", "tickets", "publish"].map((step) => (
                <label
                  key={step}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="eventStep"
                    value={step}
                    checked={selectedStep === step}
                    onChange={() => setSelectedStep(step)}
                    className="w-4 h-4 border-2 border-orange-500 accent-red-500"
                  />
                  <span>{t(`editEventPage.steps.${step}`)}</span>
                </label>
              ))}
            </div>
          </aside>
          <div className="w-full px-2 lg:w-3/4">{renderStepComponent()}</div>
        </div>
      )}
    </>
  );
};

export default EditEventPage;