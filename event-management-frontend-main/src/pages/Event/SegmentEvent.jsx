import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaList, FaUser } from "react-icons/fa";
import Swal from "sweetalert2";
import ImageCropper from "../../components/ImageCropper";

const ImageUploader = ({ onImageUpload, isReadOnly }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageToCrop, setImageToCrop] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (isReadOnly) return;
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: t('segmentEvent.imageSizeError.title'),
          text: t('segmentEvent.imageSizeError.text'),
        });
        return;
      }
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        console.log("Uploaded image:", {
          name: file.name,
          type: file.type,
          size: file.size,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
        setImageToCrop(URL.createObjectURL(file));
      };
      img.onerror = () => {
        console.error("Failed to load image:", file.name);
        Swal.fire({
          icon: "error",
          title: t('segmentEvent.invalidImageError.title'),
          text: t('segmentEvent.invalidImageError.text'),
        });
      };
    }
  };

  const handleCropComplete = (croppedImage) => {
    if (isReadOnly) return;
    if (!croppedImage) {
      Swal.fire({
        icon: "error",
        title: t('segmentEvent.cropImageError.title'),
        text: t('segmentEvent.cropImageError.text'),
      });
      return;
    }
    setSelectedFile(croppedImage.url);
    onImageUpload(croppedImage);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    if (isReadOnly) return;
    setImageToCrop(null);
  };

  const handleIconClick = () => {
    if (isReadOnly) return;
    fileInputRef.current.click();
  };

  return (
    <div>
      {imageToCrop ? (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      ) : (
        <div
          className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full w-[50px] h-[50px] cursor-pointer overflow-hidden hover:border-blue-500 transition-colors"
          onClick={handleIconClick}
        >
          {selectedFile ? (
            <img
              src={selectedFile}
              alt="Uploaded Preview"
              className="object-cover w-full h-full rounded-full"
            />
          ) : (
            <div>
              <i className="text-xl text-gray-600 fa-solid fa-image"></i>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SegmentFormPopup = ({
  isOpen,
  onClose,
  newSegment,
  handleChange,
  handleImageUpload,
  desc,
  setDesc,
  actor,
  setActor,
  onSave,
  isEditing,
  loading,
  isReadOnly
}) => {
  const { t } = useTranslation();
  if (!isOpen || isReadOnly) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          {isEditing ? t('segmentEvent.editSegment') : t('segmentEvent.addSegment')}
        </h2>
        <div className="space-y-6">
          <div>
            <label
              className="block mb-2 font-medium text-gray-700"
              htmlFor="title"
            >
              {t('segmentEvent.title')}<span className="text-red-500">*</span>
            </label>
            <input
              className="w-full p-3 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              type="text"
              id="segmentTitle"
              placeholder={t('segmentEvent.titlePlaceholder')}
              name="segmentTitle"
              value={newSegment.segmentTitle}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label
                className="block mb-2 font-medium text-gray-700"
                htmlFor="start-time"
              >
                {t('segmentEvent.startTime')}<span className="text-red-500">*</span>
              </label>
              <input
                className="w-full p-3 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                type="time"
                id="start-time"
                name="startTime"
                value={newSegment.startTime}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>
            <div className="flex-1">
              <label
                className="block mb-2 font-medium text-gray-700"
                htmlFor="end-time"
              >
                {t('segmentEvent.endTime')}<span className="text-red-500">*</span>
              </label>
              <input
                className="w-full p-3 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                type="time"
                id="end-time"
                name="endTime"
                value={newSegment.endTime}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            {!desc ? (
              <button
                className="flex items-center text-blue-600 transition hover:text-blue-800"
                onClick={() => setDesc(true)}
              >
                <FaList className="mr-2" /> {t('segmentEvent.addDescription')}
              </button>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="block mb-2 font-medium text-gray-700">
                    {t('segmentEvent.description')}
                  </label>
                  <textarea
                    className="w-full p-3 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    name="segmentDesc"
                    value={newSegment.segmentDesc}
                    onChange={handleChange}
                    placeholder={t('segmentEvent.descriptionPlaceholder')}
                    disabled={isReadOnly}
                  />
                  <div className="mt-1 text-sm text-right text-gray-400">
                    {t('segmentEvent.characterCount', { count: newSegment.segmentDesc.length })}
                  </div>
                </div>
                <i
                  className="mt-2 text-gray-500 cursor-pointer fa-solid fa-xmark hover:text-red-500"
                  onClick={() => setDesc(false)}
                ></i>
              </div>
            )}
            {!actor ? (
              <button
                className="flex items-center text-blue-600 transition hover:text-blue-800"
                onClick={() => setActor(true)}
              >
                <FaUser className="mr-2" /> {t('segmentEvent.addSpeaker')}
              </button>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="block mb-2 font-medium text-gray-700">
                    {t('segmentEvent.speakerName')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center mb-4 space-x-4">
                    <input
                      className="w-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      type="text"
                      id="speakerName"
                      placeholder={t('segmentEvent.speakerNamePlaceholder')}
                      name="speakerName"
                      value={newSegment.speakerName}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    />
                    {newSegment.speakerImage ? (
                      <div className="relative">
                        <img
                          src={newSegment.speakerImage}
                          alt="Speaker"
                          className="w-[50px] h-[50px] rounded-full object-cover"
                        />
                        <button
                          className="absolute top-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -right-4"
                          onClick={() => handleImageUpload(null)}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <ImageUploader onImageUpload={handleImageUpload} isReadOnly={isReadOnly}/>
                    )}
                  </div>
                  <label className="block mb-2 font-medium text-gray-700">
                    {t('segmentEvent.speakerDescription')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full p-3 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    name="speakerDesc"
                    value={newSegment.speakerDesc}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    placeholder={t('segmentEvent.speakerDescriptionPlaceholder')}
                  />
                  <div className="mt-1 text-sm text-right text-gray-400">
                    {t('segmentEvent.characterCount', { count: newSegment.speakerDesc.length })}
                  </div>
                </div>
                <i
                  className="mt-2 text-gray-500 cursor-pointer fa-solid fa-xmark hover:text-red-500"
                  onClick={() => setActor(false)}
                ></i>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            {t('segmentEvent.cancel')}
          </button>
          <button
            className="px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            onClick={onSave}
            disabled={loading}
          >
            {loading
              ? t('segmentEvent.saving')
              : isEditing
              ? t('segmentEvent.saveChanges')
              : t('segmentEvent.saveSegment')}
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionEvent = ({
  eventId,
  segmentData,
  onSegmentUpdate,
  eventStart,
  eventEnd,
  isReadOnly
}) => {
  const { t } = useTranslation();
  const [segments, setSegments] = useState(segmentData || []);
  const [newSegment, setNewSegment] = useState({
    eventId: eventId || "",
    segmentId: "",
    segmentTitle: "",
    segmentDesc: "",
    speakerName: "",
    speakerDesc: "",
    speakerImage: "",
    speakerImageFile: null,
    startTime: "",
    endTime: "",
  });
  const [desc, setDesc] = useState(false);
  const [actor, setActor] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Check for time overlap and event boundaries
  const checkTimeOverlap = (newStart, newEnd, excludeIndex = null) => {
    const newStartTime = new Date(`1970-01-01T${newStart}:00`);
    const newEndTime = new Date(`1970-01-01T${newEnd}:00`);

    // Check if end time is after start time
    if (newEndTime <= newStartTime) {
      Swal.fire({
        icon: "warning",
        title: t('segmentEvent.endTimeBeforeStartError.title', { defaultValue: 'Warning' }),
        text: t('segmentEvent.endTimeBeforeStartError'),
      });
      return false;
    }

    // Check if segment times are within event boundaries
    if (eventStart && eventEnd) {
      const eventStartTime = new Date(`1970-01-01T${eventStart}:00`);
      const eventEndTime = new Date(`1970-01-01T${eventEnd}:00`);

      if (newStartTime < eventStartTime) {
        Swal.fire({
          icon: "warning",
          title: t('segmentEvent.startTimeBeforeEventStartError.title', { defaultValue: 'Warning' }),
          text: t('segmentEvent.startTimeBeforeEventStartError'),
        });
        return false;
      }
      if (newEndTime > eventEndTime) {
        Swal.fire({
          icon: "warning",
          title: t('segmentEvent.endTimeAfterEventEndError.title', { defaultValue: 'Warning' }),
          text: t('segmentEvent.endTimeAfterEventEndError'),
        });
        return false;
      }
    }

    // Check for overlap with other segments
    for (let i = 0; i < segments.length; i++) {
      if (excludeIndex !== null && i === excludeIndex) continue;

      const segment = segments[i];
      const start = new Date(`1970-01-01T${segment.startTime}:00`);
      const end = new Date(`1970-01-01T${segment.endTime}:00`);

      if (
        (newStartTime >= start && newStartTime < end) ||
        (newEndTime > start && newEndTime <= end) ||
        (newStartTime <= start && newEndTime >= end)
      ) {
        Swal.fire({
          icon: "warning",
          title: t('segmentEvent.timeOverlapError.title', { defaultValue: 'Warning' }),
          text: t('segmentEvent.timeOverlapError'),
        });
        return false;
      }
    }
    return true;
  };

  // Handle input changes
  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setNewSegment((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = (data) => {
    if (isReadOnly) return;
    setNewSegment((prevData) => ({
      ...prevData,
      speakerImage: data ? data.url : "",
      speakerImageFile: data ? data.file : null,
    }));
  };

  // Handle adding a new segment
  const handleAddSlot = () => {
    if (isReadOnly) return;
    if (
      !newSegment.segmentTitle ||
      !newSegment.startTime ||
      !newSegment.endTime
    ) {
      Swal.fire({
        icon: "warning",
        title: t('segmentEvent.requiredFieldsError.title', { defaultValue: 'Warning' }),
        text: t('segmentEvent.requiredFieldsError'),
      });
      return;
    }
    if (actor && (!newSegment.speakerName || !newSegment.speakerDesc)) {
      Swal.fire({
        icon: "warning",
        title: t('segmentEvent.speakerFieldsError.title', { defaultValue: 'Warning' }),
        text: t('segmentEvent.speakerFieldsError'),
      });
      return;
    }

    // Check for time overlap and event boundaries
    if (!checkTimeOverlap(newSegment.startTime, newSegment.endTime)) {
      return;
    }

    const segmentToAdd = {
      segmentTitle: newSegment.segmentTitle,
      speaker: actor
        ? {
            speakerImage: newSegment.speakerImage,
            speakerName: newSegment.speakerName,
            speakerDesc: newSegment.speakerDesc,
          }
        : null,
      eventID: eventId || "",
      segmentDesc: newSegment.segmentDesc,
      startTime: newSegment.startTime,
      endTime: newSegment.endTime,
      isLocal: true,
    };

    const updatedSegments = [...segments, segmentToAdd];
    setSegments(updatedSegments);
    onSegmentUpdate(updatedSegments);
    resetForm();
  };

  // Handle editing an existing segment
  const handleEditSegment = (index) => {
    if (isReadOnly) return;
    const segment = segments[index];
    setNewSegment({
      eventId: eventId || "",
      segmentId: segment.segmentId || "",
      segmentTitle: segment.segmentTitle || "",
      segmentDesc: segment.segmentDesc || "",
      speakerName: segment.speaker?.speakerName || "",
      speakerDesc: segment.speaker?.speakerDesc || "",
      speakerImage: segment.speaker?.speakerImage || "",
      startTime: segment.startTime || "",
      endTime: segment.endTime || "",
    });
    setDesc(!!segment.segmentDesc);
    setActor(!!segment.speaker);
    setIsEditing(true);
    setEditIndex(index);
    setIsAdding(true);
  };

  // Handle saving the edited segment
  const handleSaveEdit = () => {
    if (isReadOnly) return;
    if (
      !newSegment.segmentTitle ||
      !newSegment.startTime ||
      !newSegment.endTime
    ) {
      Swal.fire({
        icon: "warning",
        title: t('segmentEvent.requiredFieldsError.title', { defaultValue: 'Warning' }),
        text: t('segmentEvent.requiredFieldsError'),
      });
      return;
    }
    if (actor && (!newSegment.speakerName || !newSegment.speakerDesc)) {
      Swal.fire({
        icon: "warning",
        title: t('segmentEvent.speakerFieldsError.title', { defaultValue: 'Warning' }),
        text: t('segmentEvent.speakerFieldsError'),
      });
      return;
    }

    // Check for time overlap and event boundaries
    if (
      !checkTimeOverlap(newSegment.startTime, newSegment.endTime, editIndex)
    ) {
      return;
    }

    const updatedSegment = {
      segmentId: newSegment.segmentId,
      segmentTitle: newSegment.segmentTitle,
      speaker: actor
        ? {
            speakerImage: newSegment.speakerImage,
            speakerName: newSegment.speakerName,
            speakerDesc: newSegment.speakerDesc,
          }
        : null,
      eventID: eventId || "",
      segmentDesc: newSegment.segmentDesc,
      startTime: newSegment.startTime,
      endTime: newSegment.endTime,
      isLocal: segments[editIndex]?.isLocal,
    };

    const updatedSegments = [...segments];
    updatedSegments[editIndex] = updatedSegment;
    setSegments(updatedSegments);
    onSegmentUpdate(updatedSegments);
    resetForm();
  };

  // Reset the form after adding or editing
  const resetForm = () => {
    if (isReadOnly) return;
    setNewSegment({
      eventId: eventId || "",
      segmentId: "",
      segmentTitle: "",
      segmentDesc: "",
      speakerName: "",
      speakerDesc: "",
      speakerImage: "",
      speakerImageFile: null,
      startTime: "",
      endTime: "",
    });
    setDesc(false);
    setActor(false);
    setIsAdding(false);
    setIsEditing(false);
    setEditIndex(null);
  };

  // Handle deleting a segment
  const handleDeleteSegment = async (index) => {
    if (isReadOnly) return;
    const segmentToDelete = segments[index];
    
    // Show confirmation dialog
    const result = await Swal.fire({
      title: t('segmentEvent.deleteSegmentConfirm.title'),
      text: t('segmentEvent.deleteSegmentConfirm.text', { segmentTitle: segmentToDelete.segmentTitle }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t('segmentEvent.deleteSegmentConfirm.confirmButton'),
      cancelButtonText: t('segmentEvent.deleteSegmentConfirm.cancelButton'),
    });

    // Proceed only if user clicks "Yes"
    if (result.isConfirmed) {
      if (segmentToDelete.isLocal) {
        const updatedSegments = segments.filter((_, i) => i !== index);
        setSegments(updatedSegments);
        onSegmentUpdate(updatedSegments);
        Swal.fire({
          icon: "success",
          title: t('segmentEvent.deleteSegmentSuccess.title'),
          text: t('segmentEvent.deleteSegmentSuccess.text'),
        });
      } else if (segmentToDelete.segmentId) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/segment/delete/${segmentToDelete.segmentId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              method: "DELETE",
            }
          );

          if (response.ok) {
            const updatedSegments = segments.filter((_, i) => i !== index);
            setSegments(updatedSegments);
            onSegmentUpdate(updatedSegments);
            Swal.fire({
              icon: "success",
              title: t('segmentEvent.deleteSegmentSuccess.title'),
              text: t('segmentEvent.deleteSegmentSuccess.text'),
            });
          } else {
            Swal.fire({
              icon: "warning",
              title: t('segmentEvent.deleteSegmentError.title'),
              text: t('segmentEvent.deleteSegmentError.text'),
            });
          }
        } catch (error) {
          console.error("Error deleting segment:", error);
          Swal.fire({
            icon: "warning",
            title: t('segmentEvent.deleteSegmentGeneralError.title'),
            text: t('segmentEvent.deleteSegmentGeneralError.text'),
          });
        }
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg border border-blue-500 max-w-[710px] w-full mb-4 shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">{t('segmentEvent.segments')}</h1>
      </div>
      <p className="mb-6 text-gray-600">
        {t('segmentEvent.addItinerary')}
      </p>
      <div className="flex items-center mb-4">
        <button className="pb-1 mr-4 font-medium text-blue-600 border-b-2 border-blue-600">
          {t('segmentEvent.segments')}
        </button>
        {!isReadOnly && (
            <button
              className="pb-1 text-gray-500 transition hover:text-blue-600"
              onClick={() => setIsAdding(true)}
              disabled={loading || isReadOnly}
            >
              {t('segmentEvent.addNewSegment')}
            </button>
          )}
      </div>

      {/* Segment list */}
      {segments.length > 0 &&
        segments.map((segment, index) => (
          <div
            key={index}
            className="p-3 mb-4 transition bg-white border border-gray-200 shadow-md sm:p-4 rounded-xl hover:shadow-lg"
          >
            <div className="pl-3 space-y-2 border-l-4 border-blue-400">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-500 sm:text-base">
                  {segment.startTime} - {segment.endTime}
                </span>
                {!isReadOnly && (
                    <div className="flex space-x-1">
                      <button
                        className="p-2 text-base text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-blue-600"
                        onClick={() => handleEditSegment(index)}
                      >
                        <i className="fa-solid fa-pencil"></i>
                      </button>
                      <button
                        className="p-2 text-base text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-red-600"
                        onClick={() => handleDeleteSegment(index)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  )}
              </div>
              <span className="block py-1 text-base font-semibold text-gray-800 sm:text-lg">
                {segment.segmentTitle}
              </span>
              <p className="pt-1 text-xs text-gray-700 border-t border-gray-200 sm:text-sm">
                {segment.segmentDesc}
              </p>
              {segment.speaker && (
                <div className="flex items-start gap-2 mt-1">
                  {segment.speaker.speakerImage && (
                    <img
                      src={segment.speaker.speakerImage}
                      alt={segment.speaker.speakerName}
                      className="object-cover w-10 h-10 rounded-full ring-1 ring-gray-200"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/50?text=No+Image";
                      }}
                    />
                  )}
                  <p className="text-xs text-gray-700 sm:text-sm">
                    <span className="font-medium">{t('segmentEvent.speaker')}</span>{" "}
                    {segment.speaker.speakerName} -{" "}
                    {segment.speaker.speakerDesc}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

      {/* Popup form */}
      <SegmentFormPopup
        isOpen={isAdding}
        onClose={resetForm}
        newSegment={newSegment}
        handleChange={handleChange}
        handleImageUpload={handleImageUpload}
        desc={desc}
        setDesc={setDesc}
        actor={actor}
        setActor={setActor}
        onSave={isEditing ? handleSaveEdit : handleAddSlot}
        isEditing={isEditing}
        loading={loading}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

export default SectionEvent;