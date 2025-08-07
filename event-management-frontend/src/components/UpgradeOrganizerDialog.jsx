import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Avatar,
  Box,
  Fade,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Swal from "sweetalert2";
import { useAuth } from "../pages/Auth/AuthProvider";
import { api } from "../pages/Auth/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease-in-out",
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: "auto",
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1, 3),
  textTransform: "none",
  fontWeight: 600,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
}));

const uploadFilesToCloudinary = async (files, t) => {
  if (!files || (Array.isArray(files) && files.length === 0)) return [];

  const uploadPromises = files.map(async (file) => {
    try {
      if (typeof file === "string" && file.startsWith("http")) {
        return file;
      }

      if (!(file instanceof File)) {
        Swal.fire({
          icon: "warning",
          title: t("upgradeOrganizer.errorInvalidFile"),
          text: t("upgradeOrganizer.errorInvalidFile"),
        });
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8080/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(t("upgradeOrganizer.errorUploadFailed", { message: errorText }));
      }

      const publicId = await response.text();
      if (!publicId) throw new Error(t("upgradeOrganizer.errorNoPublicId"));
      return publicId;
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("upgradeOrganizer.errorUploadFailed"),
        text: t("upgradeOrganizer.errorUploadFailed", { message: error.message }),
      });
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  return results.filter((id) => id !== null);
};

const UpgradeOrganizerDialog = ({ open, onClose }) => {
  const { t } = useTranslation(); // Initialize translation hook
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizerName: "",
    organizerLogo: null,
    organizerAddress: "",
    organizerWebsite: "",
    organizerPhone: "",
    organizerDesc: "",
  });
  const [errors, setErrors] = useState({
    organizerName: "",
    organizerLogo: "",
    organizerAddress: "",
    organizerWebsite: "",
    organizerPhone: "",
    organizerDesc: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (formData.organizerLogo instanceof File) {
      const url = URL.createObjectURL(formData.organizerLogo);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [formData.organizerLogo]);

  const handleConfirm = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      organizerName: "",
      organizerLogo: null,
      organizerAddress: "",
      organizerWebsite: "",
      organizerPhone: "",
      organizerDesc: "",
    });
    setPreviewUrl(null);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      logout();
      Swal.fire({
        icon: "success",
        title: t("upgradeOrganizer.successLogout"),
        text: t("upgradeOrganizer.successLogout"),
      });
      navigate("/login");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("upgradeOrganizer.errorLogoutFailed"),
        text: t("upgradeOrganizer.errorLogoutFailed", { message: error.msg || "Server error" }),
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, organizerLogo: file }));
    setErrors((prev) => ({ ...prev, organizerLogo: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      organizerName: "",
      organizerLogo: "",
      organizerAddress: "",
      organizerWebsite: "",
      organizerPhone: "",
      organizerDesc: "",
    };

    if (!formData.organizerName.trim()) {
      newErrors.organizerName = t("upgradeOrganizer.errorNameRequired");
      isValid = false;
    }
    if (!formData.organizerLogo) {
      newErrors.organizerLogo = t("upgradeOrganizer.errorLogoRequired");
      isValid = false;
    }
    if (!formData.organizerAddress.trim()) {
      newErrors.organizerAddress = t("upgradeOrganizer.errorAddressRequired");
      isValid = false;
    }
    if (!formData.organizerWebsite.trim()) {
      newErrors.organizerWebsite = t("upgradeOrganizer.errorWebsiteRequired");
      isValid = false;
    }
    if (!formData.organizerPhone.trim()) {
      newErrors.organizerPhone = t("upgradeOrganizer.errorPhoneRequired");
      isValid = false;
    } else if (!/^\+?\d{10,15}$/.test(formData.organizerPhone)) {
      newErrors.organizerPhone = t("upgradeOrganizer.errorInvalidPhone");
      isValid = false;
    }
    if (!formData.organizerDesc.trim()) {
      newErrors.organizerDesc = t("upgradeOrganizer.errorDescRequired");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpToOrganize = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const organizerLogoId = formData.organizerLogo
        ? (await uploadFilesToCloudinary([formData.organizerLogo], t))[0]
        : null;

      if (!organizerLogoId) {
        Swal.fire({
          icon: "error",
          title: t("upgradeOrganizer.errorUploadLogo"),
          text: t("upgradeOrganizer.errorUploadLogo"),
        });
        return;
      }

      const payload = {
        ...formData,
        organizerLogo: organizerLogoId,
      };

      const response = await fetch(
        `http://localhost:8080/api/auth/user/upgrade-organizer/${user.email}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: t("upgradeOrganizer.successUpgrade"),
          text: t("upgradeOrganizer.successUpgrade"),
        });
        setShowForm(false);
        onClose();
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: t("upgradeOrganizer.errorUpgradeFailed"),
          text: t("upgradeOrganizer.errorUpgradeFailed", { message: errorData.message || "Please try again" }),
        });
      }
    } catch (error) {
      console.error("Error upgrading to organizer:", error);
      Swal.fire({
        icon: "error",
        title: t("upgradeOrganizer.errorGeneral"),
        text: t("upgradeOrganizer.errorGeneral"),
      });
    } finally {
      setIsLoading(false);
      handleLogout();
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 400 }}
    >
      {!showForm ? (
        <>
          <DialogTitle sx={{ fontWeight: 600, textAlign: "center" }}>
            {t("upgradeOrganizer.upgradeToOrganizer")} {/* Translated title */}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              {t("upgradeOrganizer.confirmUpgrade")} {/* Translated confirmation text */}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <StyledButton onClick={handleCancel} color="inherit">
              {t("upgradeOrganizer.no")} {/* Translated "No" */}
            </StyledButton>
            <StyledButton
              onClick={handleConfirm}
              color="primary"
              variant="contained"
              disabled={isLoading}
            >
              {t("upgradeOrganizer.yes")} {/* Translated "Yes" */}
            </StyledButton>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle sx={{ fontWeight: 600, textAlign: "center" }}>
            {t("upgradeOrganizer.organizerInfo")} {/* Translated title */}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <StyledAvatar
                src={previewUrl || "/default-logo.png"}
                alt={t("upgradeOrganizer.organizerLogo")} // Translated alt text
              />
            </Box>
            <TextField
              fullWidth
              label={t("upgradeOrganizer.organizerLogo")} // Translated label
              type="file"
              name="organizerLogo"
              onChange={handleFileChange}
              error={!!errors.organizerLogo}
              helperText={errors.organizerLogo}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ accept: "image/*" }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t("upgradeOrganizer.organizerName")} // Translated label
              name="organizerName"
              value={formData.organizerName}
              onChange={handleInputChange}
              error={!!errors.organizerName}
              helperText={errors.organizerName}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t("upgradeOrganizer.organizerAddress")} // Translated label
              name="organizerAddress"
              value={formData.organizerAddress}
              onChange={handleInputChange}
              error={!!errors.organizerAddress}
              helperText={errors.organizerAddress}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t("upgradeOrganizer.organizerWebsite")} // Translated label
              name="organizerWebsite"
              value={formData.organizerWebsite}
              onChange={handleInputChange}
              error={!!errors.organizerWebsite}
              helperText={errors.organizerWebsite}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t("upgradeOrganizer.organizerPhone")} // Translated label
              name="organizerPhone"
              value={formData.organizerPhone}
              onChange={handleInputChange}
              error={!!errors.organizerPhone}
              helperText={errors.organizerPhone}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t("upgradeOrganizer.organizerDesc")} // Translated label
              name="organizerDesc"
              value={formData.organizerDesc}
              onChange={handleInputChange}
              error={!!errors.organizerDesc}
              helperText={errors.organizerDesc}
              margin="normal"
              required
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <StyledButton onClick={handleCancel} color="inherit" disabled={isLoading}>
              {t("upgradeOrganizer.cancel")} {/* Translated "Cancel" */}
            </StyledButton>
            <StyledButton
              onClick={handleUpToOrganize}
              color="primary"
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "white", mr: 1 }} />
              ) : (
                t("upgradeOrganizer.upgradeButton") // Translated button text
              )}
            </StyledButton>
          </DialogActions>
        </>
      )}
    </StyledDialog>
  );
};

export default UpgradeOrganizerDialog;