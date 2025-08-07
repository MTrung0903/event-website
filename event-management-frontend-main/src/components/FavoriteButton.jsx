import { useState, useEffect } from "react";
import { useAuth } from "../pages/Auth/AuthProvider";
import { useTranslation } from "react-i18next"; // Import useTranslation
import Swal from "sweetalert2";

const FavoriteButton = ({ eventId }) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  // Fetch favorite events
  const getFavorites = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/favorites/${user.userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(t("favoriteButton.errorFetchFavorites")); // Translated error
      }
      const data = await response.json();
      const favoriteEventIds = new Set(data.map(event => event.eventId));
      setIsFavorite(favoriteEventIds.has(eventId));
    } catch (error) {
      console.error("Error fetching favorite events:", error);
      Swal.fire({
        icon: 'error',
        title: t("favoriteButton.errorFetchFavorites"),
        text: t("favoriteButton.errorFetchFavorites"),
      });
    }
  };

  // Add event to favorites
  const addFavorite = async () => {
    try {
      const favoriteEvent = { userId: user.userId, eventId };
      const response = await fetch("http://localhost:8080/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(favoriteEvent),
      });
      if (!response.ok) {
        throw new Error(t("favoriteButton.errorAddFavorite")); // Translated error
      }
      setIsFavorite(true);
    } catch (error) {
      console.error("Error adding favorite event:", error);
      Swal.fire({
        icon: 'error',
        title: t("favoriteButton.errorAddFavorite"),
        text: t("favoriteButton.errorAddFavorite"),
      });
    }
  };

  // Remove event from favorites
  const removeFavorite = async () => {
    try {
      const favoriteEvent = { userId: user.userId, eventId };
      const response = await fetch("http://localhost:8080/api/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(favoriteEvent),
      });
      if (!response.ok) {
        throw new Error(t("favoriteButton.errorRemoveFavorite")); // Translated error
      }
      setIsFavorite(false);
    } catch (error) {
      console.error("Error removing favorite event:", error);
      Swal.fire({
        icon: 'error',
        title: t("favoriteButton.errorRemoveFavorite"),
        text: t("favoriteButton.errorRemoveFavorite"),
      });
    }
  };

  // Toggle favorite status
  const toggleFavorite = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFavorite();
    } else {
      addFavorite();
    }
  };

  // Fetch favorites on mount
  useEffect(() => {
    if (user) {
      getFavorites();
    }
  }, [user, eventId, t]); // Add t to dependencies for language changes

  return (
    <i
      className={`fa-heart text-white absolute bottom-2 right-2 text-[24px] p-2 rounded-full cursor-pointer ${
        isFavorite ? "fa-solid bg-red-500" : "fa-regular hover:bg-red-500"
      }`}
      onClick={toggleFavorite}
    ></i>
  );
};

export default FavoriteButton;