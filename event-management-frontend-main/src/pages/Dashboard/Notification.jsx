import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, MoreHorizontal } from "lucide-react";
import { useAuth } from "../Auth/AuthProvider";
import Footer from "../../components/Footer";
const NotificationList = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const token = localStorage.getItem("token");

  const fetchHistory = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/notify/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(t('notifications.errorFetch'));
      }
      const result = await response.json();
      if (result.statusCode === 200) {
        setNotifications(result.data);
      } else {
        throw new Error(result.msg || t('notifications.errorFetch'));
      }
    } catch (error) {
      console.error("Failed to load notification history:", error);
    }
  };

  const readNoti = async (notiId) => {
    try {
      const response = await fetch(`http://localhost:8080/notify/${notiId}/read`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error(t('notifications.errorMarkRead'));
      }
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notiId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const readAllNoti = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/notify/readAll/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error(t('notifications.errorMarkAllRead'));
      }
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchHistory(user.userId);
    }
    window.scrollTo(0, 0);
  }, [user]);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(i18n.language, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const translateTitle = (title) => {
    if (title === 'New Message') {
      return t('notifications.newMessageTitle')
    }
    else if (title === 'New Event') {
      return t('notifications.newEventTitle')
    }
    else {
      return t('notifications.notiTitle')
    }
  };
  const translateMessage = (message) => {
    if (message.includes('You have a new message from')) {
      const user = message.replace('You have a new message from ', '');
      return t('notifications.newMessage', { user });
    }
    else if (message.includes('You have saved the')) {
      const newMessage1 = message.replace('You have saved the ', '');
      const event = newMessage1.replace(' event on your favorite list', '');
      return t('notifications.noti', { event })
    }
    else {
      const event = message.replace(' was successfully created', '');
      return t('notifications.noti', { event})
    }
  };
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((notif) => !notif.read);


  return (
    <>
      <div className="mx-auto max-w-3xl min-h-[800px] p-6 bg-white rounded-xl shadow-lg transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('notifications.header')}
          </h1>
          <div className="flex items-center space-x-3">
            <button
              className="text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => readAllNoti(user?.userId)}
              disabled={!notifications.some((notif) => !notif.read)}
              aria-label={t('notifications.markAllAsRead')}
            >
              {t('notifications.markAllAsRead')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-6 space-x-2 bg-gray-100 rounded-lg">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("all")}
            aria-label={t('notifications.tabAll')}
          >
            {t('notifications.tabAll')}
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === "unread"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-200"
              }`}
            onClick={() => setActiveTab("unread")}
            aria-label={t('notifications.tabUnread')}
          >
            {t('notifications.tabUnread')}
          </button>
        </div>

        {/* List notifications */}
        <h2 className="mb-4 text-sm font-semibold text-gray-500">
          {t('notifications.previousSection')}
        </h2>
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              {t('notifications.noNotifications')}
            </p>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start p-4 space-x-4 transition-all duration-200 rounded-lg shadow-sm cursor-pointer bg-gray-50 hover:bg-indigo-50"
              >
                <Bell className="flex-shrink-0 w-10 h-10 p-2 text-indigo-500" />
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-gray-900">
                    <span className="font-semibold text-indigo-700">{translateTitle(notif.title)}</span>{" "}
                    {translateMessage(notif.message)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDateTime(notif.createdAt)}
                  </p>
                  {!notif.read && (
                    <button
                      className="mt-2 text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-800"
                      onClick={() => readNoti(notif.id)}
                      aria-label={t('notifications.markAsRead')}
                    >
                      {t('notifications.markAsRead')}
                    </button>
                  )}
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotificationList;