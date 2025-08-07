import React, { useState, useEffect, useRef } from "react";
import { useWebSocket } from "./WebSocketContext";
import axios from "axios";
import { FaBars, FaSearch } from "react-icons/fa";
import { MdInsertEmoticon } from "react-icons/md";
import Picker from "emoji-picker-react";
import { IoIosLink } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import MediaPreviewModal from "./MediaPreviewModal";
import Swal from "sweetalert2";
import { useTranslation } from 'react-i18next';
import { getCloudinaryUrl } from "./cloudinary";

const ChatBox = () => {
  const { t } = useTranslation();
  const { stompClient, isConnected } = useWebSocket();
  const [users, setUsers] = useState([]);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typingStatus, setTypingStatus] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [currentUser, setCurrentUser] = useState({ userId: "", email: "" });
  const token = localStorage.getItem("token");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState({ url: "", type: "" });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const openPreview = (mediaUrl, contentType) => {
    console.log("Opening preview:", { mediaUrl, contentType });
    const url = getCloudinaryUrl(mediaUrl, contentType);
    setPreviewMedia({ url, type: contentType });
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    console.log("Closing preview");
    setIsPreviewOpen(false);
    setPreviewMedia({ url: "", type: "" });
  };

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (!payload.userId || !payload.sub) {
          Swal.fire({
            icon: "error",
            title: t('errors.generic'),
            text: t('errors.invalidSession'),
          });
          return;
        }
        const user = {
          userId: payload.userId,
          email: payload.sub,
        };
        setCurrentUser(user);
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: t('errors.generic'),
          text: t('errors.authFailed'),
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: t('errors.generic'),
        text: t('errors.loginRequired'),
      });
    }
  }, [token]);

  const fetchUser = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/chat/${userId}/list-chat`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error(
          `Lấy danh sách người dùng thất bại: ${response.status}`
        );
      }
      const listUser = await response.json();
      const formattedUsers = listUser.map((user) => ({
        userId: user.userId,
        email: user.email,
        name: user.fullName || "Unknown",
        unreadCount: user.unreadCount || 0,
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching user list:", error);
      Swal.fire({
        icon: "error",
        title: t('errors.generic'),
        text: t('errors.loadUserListFailed'),
      });
    }
  };

  useEffect(() => {
    if (currentUser.userId) {
      fetchUser(currentUser.userId);
    }
  }, [currentUser.userId]);

  const searchUsers = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchedUsers([]);
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8080/chat/search?query=${encodeURIComponent(
          query
        )}&currentUserId=${currentUser.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const formattedUsers = response.data.map((user) => ({
        userId: user.userId,
        email: user.email,
        name: user.fullName || "Unknown",
        unreadCount: user.unreadCount || 0,
      }));
      setSearchedUsers(formattedUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchedUsers([]);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentUser.userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedUser && currentUser.userId) {
      axios
        .get(
          `http://localhost:8080/chat/history/${currentUser.userId}/${selectedUser.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setMessages(response.data);
          setUsers((prev) =>
            prev.map((user) =>
              user.userId === selectedUser.userId
                ? { ...user, unreadCount: 0 }
                : user
            )
          );
          setSearchedUsers((prev) =>
            prev.map((user) =>
              user.userId === selectedUser.userId
                ? { ...user, unreadCount: 0 }
                : user
            )
          );
        })
        .catch((error) => {
          console.error("Error fetching chat history:", error);
          Swal.fire({
            icon: "error",
            title: t('errors.generic'),
            text: t('errors.loadChatHistoryFailed'),
          });
        });
    }
  }, [selectedUser, currentUser.userId, token]);

  useEffect(() => {
    if (stompClient && currentUser.email && isConnected) {
      const messageSubscription = stompClient.subscribe(
        `/user/${currentUser.email}/chat`,
        (message) => {
          const receivedMessage = JSON.parse(message.body);
          if (
            selectedUser &&
            (receivedMessage.senderEmail === selectedUser.email ||
              receivedMessage.recipientEmail === selectedUser.email)
          ) {
            setMessages((prevMessages) => {
              const messageKey = `${receivedMessage.timestamp}_${
                receivedMessage.senderEmail
              }_${receivedMessage.mediaUrl || ""}`;
              if (
                prevMessages.some(
                  (msg) =>
                    `${msg.timestamp}_${msg.senderEmail}_${
                      msg.mediaUrl || ""
                    }` === messageKey
                )
              ) {
                return prevMessages;
              }
              return [...prevMessages, receivedMessage];
            });
          } else {
            const senderEmail = receivedMessage.senderEmail;
            setUsers((prev) =>
              prev.map((user) =>
                user.email === senderEmail && user.userId !== selectedUser?.userId
                  ? { ...user, unreadCount: (user.unreadCount || 0) + 1 }
                  : user
              )
            );
            setSearchedUsers((prev) =>
              prev.map((user) =>
                user.email === senderEmail && user.userId !== selectedUser?.userId
                  ? { ...user, unreadCount: (user.unreadCount || 0) + 1 }
                  : user
              )
            );
          }
        }
      );

      const typingSubscription = stompClient.subscribe(
        `/user/${currentUser.email}/typing`,
        (message) => {
          const typingData = JSON.parse(message.body);
          setTypingStatus((prev) => ({
            ...prev,
            [typingData.senderEmail]: typingData.isTyping,
          }));
        }
      );

      return () => {
        messageSubscription?.unsubscribe();
        typingSubscription?.unsubscribe();
      };
    }
  }, [stompClient, currentUser.email, isConnected, selectedUser]);

  useEffect(() => {
    if (stompClient && selectedUser && inputMessage && isConnected) {
      const typingDTO = {
        senderEmail: currentUser.email,
        recipientEmail: selectedUser.email,
        isTyping: true,
      };
      const timer = setTimeout(() => {
        stompClient.send("/app/typing", {}, JSON.stringify(typingDTO));
      }, 500);
      return () => clearTimeout(timer);
    }
    if (stompClient && selectedUser && isConnected) {
      const typingDTO = {
        senderEmail: currentUser.email,
        recipientEmail: selectedUser.email,
        isTyping: false,
      };
      stompClient.send("/app/typing", {}, JSON.stringify(typingDTO));
    }
  }, [inputMessage, stompClient, selectedUser, currentUser.email, isConnected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8080/chat/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const fileName = response.data;
      const contentType = file.type.startsWith("image") ? "IMAGE" : "VIDEO";

      const messageDTO = {
        content: "",
        senderEmail: currentUser.email,
        recipientEmail: selectedUser.email,
        timestamp: new Date().toISOString(),
        isRead: false,
        mediaUrl: fileName,
        contentType,
      };
      console.log("Sending messageDTO:", messageDTO);

      stompClient.send("/app/chat", {}, JSON.stringify(messageDTO));
      setMessages((prev) => [...prev, messageDTO]);
    } catch (error) {
      console.error("Error uploading file:", error);
      Swal.fire({
        icon: "error",
        title: t('errors.generic'),
        text: t('errors.uploadFileFailed'),
      });
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && selectedUser && stompClient && isConnected) {
      const messageDTO = {
        content: inputMessage,
        senderEmail: currentUser.email,
        recipientEmail: selectedUser.email,
        timestamp: new Date().toISOString(),
        isRead: false,
        mediaUrl: "",
        contentType: inputMessage.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/)
          ? "EMOJI"
          : "TEXT",
      };

      stompClient.send("/app/chat", {}, JSON.stringify(messageDTO));
      setMessages((prevMessages) => [...prevMessages, messageDTO]);
      if (!users.some((user) => user.userId === selectedUser.userId)) {
        setUsers((prev) => [...prev, { ...selectedUser, unreadCount: 0 }]);
      }
      setInputMessage("");
      setShowEmojiPicker(false);
    } else {
      if (!isConnected) {
        Swal.fire({
          icon: "error",
          title: t('errors.generic'),
          text: t('errors.websocketLost'),
        });
      } else if (!selectedUser) {
        Swal.fire({
          icon: "error",
          title: t('errors.generic'),
          text: t('errors.noUserSelected'),
        });
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const renderMessageContent = (msg) => {
    if (!msg || !msg.contentType) {
      return <p className="text-red-500">{t('messages.invalidMessage')}</p>;
    }
    try {
      if (msg.contentType === "IMAGE") {
        if (!msg.mediaUrl) {
          return <p className="text-red-500">{t('messages.noImageUrl')}</p>;
        }
        const imageUrl = getCloudinaryUrl(msg.mediaUrl, "IMAGE");
        return (
          <img
            src={imageUrl}
            alt="media"
            className="max-w-[300px] rounded"
            onClick={() => openPreview(msg.mediaUrl, "IMAGE")}
            onError={(e) => {
              e.target.replaceWith(
                <span className="text-red-500">{t('messages.imageLoadFailed')}</span>
              );
            }}
          />
        );
      }
      if (msg.contentType === "VIDEO") {
        const videoUrl = getCloudinaryUrl(msg.mediaUrl, "VIDEO");
        return (
          <video
            controls
            className="max-w-[200px] rounded cursor-pointer"
            onClick={() => openPreview(msg.mediaUrl, "VIDEO")}
          >
            <source src={videoUrl} type="video/mp4" />
            {t('messages.videoNotSupported')}
          </video>
        );
      }
      if (msg.contentType === "TEXT" || msg.contentType === "EMOJI") {
        return <p>{msg.content || t('messages.emptyContent')}</p>;
      }
      return (
        <p>
          {typeof msg.content === "string"
            ? msg.content
            : t('messages.undefinedContent')}
        </p>
      );
    } catch (error) {
      return <p className="text-red-500">{t('messages.displayError')}</p>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-48px)] max-w-7xl mx-auto shadow-2xl rounded-2xl overflow-hidden">
      <button
        className="fixed z-50 p-3 text-gray-600 bg-white rounded-full shadow-md sm:hidden top-4 left-4 hover:bg-gray-100"
        onClick={toggleSidebar}
      >
        <FaBars className="text-lg" />
      </button>
      <div
        className={`fixed sm:static top-0 left-0 h-full bg-white border-r border-gray-200 transition-transform duration-300 w-80 sm:w-1/3 lg:w-1/4 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{t('chatBox.title')}</h2>
          <div className="flex items-center p-2 mt-3 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <FaSearch className="mr-2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('chatBox.searchPlaceholder')}
              className="flex-1 text-sm bg-transparent outline-none focus:ring-0"
            />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-120px)]">
          {searchQuery ? (
            searchedUsers.length > 0 ? (
              searchedUsers.map((user) => (
                <div
                  key={user.userId}
                  className={`p-4 flex items-center cursor-pointer hover:bg-teal-50 ${
                    selectedUser?.userId === user.userId ? "bg-teal-100" : ""
                  } ${user.unreadCount > 0 ? "font-semibold bg-gray-100" : ""}`}
                  onClick={() => {
                    setSelectedUser(user);
                    setIsSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center justify-center w-10 h-10 text-base text-white bg-teal-500 rounded-full shadow-sm">
                    {user.name[0]}
                  </div>
                  <div className="flex items-center flex-1 ml-3">
                    <p className="text-sm truncate">{user.name}</p>
                    {user.unreadCount > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 ml-2 text-xs text-white bg-red-500 rounded-full">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">
                {t('chatBox.noUsersFound')}
              </p>
            )
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.userId}
                className={`p-4 flex items-center cursor-pointer hover:bg-teal-50 ${
                  selectedUser?.userId === user.userId ? "bg-teal-100" : ""
                } ${user.unreadCount > 0 ? "font-semibold bg-gray-100" : ""}`}
                onClick={() => {
                  setSelectedUser(user);
                  setIsSidebarOpen(false);
                }}
              >
                <div className="flex items-center justify-center w-10 h-10 text-base text-white bg-teal-500 rounded-full shadow-sm">
                  {user.name[0]}
                </div>
                <div className="flex items-center flex-1 ml-3">
                  <p className="text-sm truncate">{user.name}</p>
                  {user.unreadCount > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 ml-2 text-xs text-white bg-red-500 rounded-full">
                      {user.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-gray-500">
              {t('chatBox.noChatHistory')}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col flex-1 bg-white">
        {selectedUser ? (
          <>
            <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-center w-10 h-10 text-base text-white bg-teal-500 rounded-full shadow-sm">
                {selectedUser.name[0]}
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-800 truncate">
                {selectedUser.name}
              </h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.timestamp}_${msg.senderEmail}_${index}`}
                  className={`mb-4 flex ${
                    msg.senderEmail === currentUser.email
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] sm:max-w-md p-3 rounded-lg text-sm shadow-sm ${
                      msg.senderEmail === currentUser.email
                        ? "bg-teal-500 text-white"
                        : msg.isRead
                        ? "bg-white text-gray-800 border border-gray-200"
                        : "bg-gray-100 text-gray-800 border border-gray-300 font-semibold"
                    }`}
                  >
                    {renderMessageContent(msg)}
                    <p className="mt-1 text-xs opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {typingStatus[selectedUser.email] && (
                <div className="text-xs text-gray-500 animate-pulse">
                  {t('chatBox.typing')}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              {showEmojiPicker && (
                <Picker
                  onEmojiClick={(emojiObject) => {
                    setInputMessage((prev) => prev + emojiObject.emoji);
                    setShowEmojiPicker(false);
                  }}
                />
              )}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="px-2 py-1 text-gray-600"
                >
                  <MdInsertEmoticon />
                </button>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="px-2 py-1 text-gray-600"
                >
                  <IoIosLink />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('chatBox.messagePlaceholder')}
                  className="flex-1 p-3 text-sm border border-gray-200 rounded-lg shadow-sm bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600"
                >
                  <IoSend />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 bg-gray-50">
            <p className="text-base text-gray-500">
              {t('chatBox.selectUserPrompt')}
            </p>
          </div>
        )}
      </div>
      <MediaPreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        mediaUrl={previewMedia.url}
        contentType={previewMedia.type}
      />
    </div>
  );
};

export default ChatBox;