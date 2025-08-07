import React, { useState, useEffect } from "react";
import { useAuth } from "../Auth/AuthProvider";
import Loader from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { useTranslation } from "react-i18next";

const EventPage = () => {
    const navigate = useNavigate();
    const [favoriteEvents, setFavoriteEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const token = localStorage.getItem("token");
    const { t } = useTranslation();
    // Hàm lấy danh sách sự kiện yêu thích
    const fetchFavoriteEvents = async () => {

        try {
            const response = await fetch(`http://localhost:8080/api/favorites/${user.userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(t("favorites.event.error"));
            }
            const data = await response.json();
            setFavoriteEvents(data);
        } catch (error) {
            setError(error.message);
            console.error("Error fetching favorite events:", error);

        } finally {
            setLoading(false);
        }
    };
    const handleEventClick = (eventId) => {
        navigate(`/event/${eventId}`);
    };
    // Gọi API khi component mount
    useEffect(() => {
        fetchFavoriteEvents();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <p className="text-red-600 font-semibold">
                        {t("favoritesPage.error", { message: error })}
                    </p>
                    <p className="text-gray-500 mt-2">{t("favorites.event-page.try-again")}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Tiêu đề */}
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        {t("favoritesPage.title")}
                    </h2>
                    {/* Danh sách sự kiện */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteEvents.map((event) => (
                            <div
                                key={event.eventId}
                                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                <img
                                    src={
                                        event.eventImages && event.eventImages.length > 0
                                            ? event.eventImages[0]
                                            : "https://via.placeholder.com/300x150"
                                    }
                                    alt={event.eventName}
                                    className="w-full h-48 object-cover rounded-t-xl"
                                />
                                <div className="p-5">
                                    <h3 className="text-xl font-semibold text-gray-900 truncate">
                                        {event.eventName || t("favoritesPage.unnamedEvent")} {/* Translated fallback */}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {new Date(event.eventStart).toLocaleDateString("vi-VN")} •{" "}
                                        {event.eventLocation?.city || event.eventLocation?.address || "Online"}
                                    </p>
                                    <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                        onClick={() => handleEventClick(event.eventId)}>
                                        <i className="ti ti-arrow-right"></i>
                                        {t("favoritesPage.viewDetails")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hiển thị khi không có sự kiện */}
                    {favoriteEvents.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                            <p className="text-gray-500 text-lg">{t("favoritesPage.noFavorites")}</p>
                            <p className="text-gray-400 mt-2">{t("favoritesPage.noFavoritesPrompt")}</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EventPage;