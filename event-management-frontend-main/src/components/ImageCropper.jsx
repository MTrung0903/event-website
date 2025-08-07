import React, { useState, useEffect, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Swal from "sweetalert2";
import { useTranslation } from 'react-i18next';

const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspectRatio }) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({
    unit: "px",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    aspect: aspectRatio,
  });
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isLargeImage, setIsLargeImage] = useState(false);
  const [isRatioClose, setIsRatioClose] = useState(false);
  const imageRef = useRef(null);

  const TARGET_WIDTH = aspectRatio === 1 ? 300 : 940;
  const TARGET_HEIGHT = TARGET_WIDTH / aspectRatio;
  const EXPECTED_RATIO = 940 / 530; // ~1.7736
  const RATIO_TOLERANCE = 0.1; // ±10%

  useEffect(() => {
    if (!imageSrc) {
      Swal.fire({
        icon: "error",
        title: t('imageCropper.error'),
        text: t('imageCropper.errorInvalidSrc'),
      });
      onCancel();
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      setImage(img);
      setImageDimensions({ width, height });

      // Kiểm tra ảnh lớn và tỷ lệ
      const isLarge = width >= TARGET_WIDTH && height >= TARGET_HEIGHT;
      const imageRatio = width / height;
      const isClose = Math.abs(imageRatio - EXPECTED_RATIO) / EXPECTED_RATIO <= RATIO_TOLERANCE;
      setIsLargeImage(isLarge);
      setIsRatioClose(isClose);

      if (isLarge && isClose && aspectRatio !== 1) {
        // Ảnh lớn, tỷ lệ gần: Không cần khung cắt, scale toàn ảnh
        setCrop({
          unit: "px",
          x: 0,
          y: 0,
          width: width,
          height: height,
          aspect: aspectRatio,
        });
      } else {
        // Ảnh nhỏ hoặc tỷ lệ khác: Khung cắt kéo thả
        const cropWidth = Math.min(width, TARGET_WIDTH * 0.5); // Mặc định 50% hoặc nhỏ hơn
        const cropHeight = cropWidth / aspectRatio;
        setCrop({
          unit: "px",
          x: (width - cropWidth) / 2,
          y: (height - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight,
          aspect: aspectRatio,
        });
      }

      console.log("Image loaded:", {
        naturalWidth: width,
        naturalHeight: height,
        isLarge,
        isRatioClose,
        imageRatio,
      });
    };
    img.onerror = () => {
      console.error("Failed to load image:", { imageSrc });
      Swal.fire({
        icon: "error",
        title: t('imageCropper.error'),
        text: t('imageCropper.errorLoadImage'),
      });
      onCancel();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc, aspectRatio, onCancel, t]);

  const getCroppedImg = (imageSrc, crop, image) => {
    return new Promise((resolve) => {
      if (!image || !crop.width || !crop.height) {
        Swal.fire({
          icon: "error",
          title: t('imageCropper.error'),
          text: t('imageCropper.errorInvalidCrop'),
        });
        resolve(null);
        return;
      }

      const pixelCrop = {
        x: Math.max(0, Math.min(crop.x, image.naturalWidth)),
        y: Math.max(0, Math.min(crop.y, image.naturalHeight)),
        width: Math.min(crop.width, image.naturalWidth - crop.x),
        height: Math.min(crop.height, image.naturalHeight - crop.y),
      };

      const canvas = document.createElement("canvas");
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";

      if (
        pixelCrop.width <= 0 ||
        pixelCrop.height <= 0 ||
        pixelCrop.x + pixelCrop.width > image.naturalWidth ||
        pixelCrop.y + pixelCrop.height > image.naturalHeight
      ) {
        Swal.fire({
          icon: "error",
          title: t('imageCropper.error'),
          text: t('imageCropper.errorInvalidCropArea'),
        });
        resolve(null);
        return;
      }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            Swal.fire({
              icon: "error",
              title: t('imageCropper.error'),
              text: t('imageCropper.errorImage'),
            });
            resolve(null);
            return;
          }
          const url = URL.createObjectURL(blob);
          console.log("Image cropped:", {
            width: TARGET_WIDTH,
            height: TARGET_HEIGHT,
            pixelCrop,
          });
          resolve({ blob, url });
        },
        "image/jpeg",
        0.8
      );
    });
  };

  const handleCropComplete = async () => {
    if (imageSrc && crop.width && crop.height && image) {
      const croppedImage = await getCroppedImg(imageSrc, crop, image);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } else {
      Swal.fire({
        icon: "error",
        title: t('imageCropper.error'),
        text: t('imageCropper.errorInvalidCrop'),
      });
    }
  };

  const handleUseOriginal = async () => {
    try {
      const response = await fetch(imageSrc, { mode: "cors" });
      const blob = await response.blob();
      if (!blob) {
        Swal.fire({
          icon: "error",
          title: t('imageCropper.error'),
          text: t('imageCropper.errorRetrieveOriginalImage'),
        });
        return;
      }
      const originalImage = { blob, url: URL.createObjectURL(blob) };
      console.log("Original image:", {
        width: imageDimensions.width,
        height: imageDimensions.height,
      });
      onCropComplete(originalImage);
    } catch (error) {
      console.error("Failed to retrieve original image:", error);
      Swal.fire({
        icon: "error",
        title: t('imageCropper.error'),
        text: t('imageCropper.errorRetrieveOriginalImage'),
      });
    }
  };

  // Tính kích thước hiển thị
  let displayWidth, displayHeight;
  if (isLargeImage && isRatioClose && aspectRatio !== 1) {
    displayWidth = TARGET_WIDTH;
    displayHeight = TARGET_HEIGHT;
  } else {
    displayWidth = imageDimensions.width;
    displayHeight = imageDimensions.height;
  }

  // Tính kích thước popup
  const popupWidth = Math.min(displayWidth + 48, window.innerWidth - 32); // Padding 24px
  const popupHeight = Math.min(displayHeight + 148, window.innerHeight - 32); // Header 48px, footer 48px, padding 52px

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 overflow-auto bg-black bg-opacity-50">
      <div
        className="flex flex-col w-full p-6 bg-white rounded-lg"
        style={{
          minWidth: '400px',
          maxWidth: `${popupWidth}px`,
          minHeight: '400px',
          maxHeight: `${popupHeight}px`,
        }}
      >
        <h2 className="mb-4 text-xl font-semibold">{t('imageCropper.cropImage')}</h2>
        {image ? (
          <div className="relative flex-1 overflow-auto">
            <div
              className="relative"
              style={{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
              }}
            >
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                aspect={aspectRatio}
                disabled={isLargeImage && isRatioClose && aspectRatio !== 1} // Vô hiệu hóa khung cắt
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop"
                  style={{
                    width: `${displayWidth}px`,
                    height: `${displayHeight}px`,
                    display: 'block',
                    objectFit: 'none',
                  }}
                  crossOrigin="anonymous"
                />
              </ReactCrop>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {t('imageCropper.imageSize')}: {imageDimensions.width}x{imageDimensions.height}px
              {crop.width && crop.height ? (
                <span>
                  {" | "} {t('imageCropper.cropSize')}: {Math.round(crop.width)}x{Math.round(crop.height)}px
                </span>
              ) : null}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="ml-2">{t('imageCropper.loadingImage')}</p>
          </div>
        )}
        <div className="sticky bottom-0 flex justify-end pt-2 mt-4 space-x-2 bg-white">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            {t('imageCropper.cancel')}
          </button>
          <button
            onClick={handleUseOriginal}
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
            disabled={!image}
          >
            {t('imageCropper.useOriginal')}
          </button>
          <button
            onClick={handleCropComplete}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            disabled={!image || !crop.width || !crop.height}
          >
            {t('imageCropper.crop')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;