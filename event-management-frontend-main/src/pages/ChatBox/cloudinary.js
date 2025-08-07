const CLOUDINARY_CLOUD_NAME ="dho1vjupv";

export const getCloudinaryUrl = (publicId, contentType) => {
  if (!publicId) return "";
  const resourceType = contentType === "VIDEO" ? "video" : "image";
  const format = contentType === "VIDEO" ? "mp4" : "jpg";
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${publicId}.${format}`;
};