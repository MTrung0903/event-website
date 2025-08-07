import React from "react";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from 'react-i18next';

const MediaPreviewModal = ({ isOpen, onClose, mediaUrl, contentType }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-0 bg-gray-800 text-white rounded-full p-3 hover:bg-gray-700"
        >
          <IoMdClose />
        </button>
        {contentType === "IMAGE" && (
          <img
            src={mediaUrl}
            alt="preview"
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error(`Failed to load preview image: ${mediaUrl}`);
              e.target.replaceWith(<span className="text-red-500">{t('mediaPreview.imageLoadFailed')}</span>);
            }}
          />
        )}
        {contentType === "VIDEO" && (
          <video
            controls
            className="w-full h-full object-contain rounded-lg mt-2"
            autoPlay
          >
            <source src={mediaUrl} type="video/mp4" />
            {t('mediaPreview.videoNotSupported')}
          </video>
        )}
      </div>
    </div>
  );
};

export default MediaPreviewModal;