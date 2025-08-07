import React, { useState, useEffect, useRef } from "react";
import { useWebSocket } from "./WebSocketContext";
import axios from "axios";
import Picker from "emoji-picker-react";
import { IoIosLink } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import MediaPreviewModal from "./MediaPreviewModal";
import { MdInsertEmoticon } from "react-icons/md";
import Swal from "sweetalert2";
import { useTranslation } from 'react-i18next';
import { getCloudinaryUrl } from "./cloudinary";

const ChatBubble = ({ currentUser, initialSelectedUser, onClose }) => {
  const { t } = useTranslation();
  const { stompClient, isConnected } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(initialSelectedUser || null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingStatus, setTypingStatus] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState({ url: "", type: "" });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        console.log("Clicked outside, closing emoji picker");
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    if (initialSelectedUser) {
      setIsOpen(true);
      setSelectedUser(initialSelectedUser);
    }
  }, [initialSelectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/chat/${currentUser.userId}/list-chat`,
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
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      Swal.fire({
        icon: "error",
        title: t('errors.generic'),
        text: t('errors.loadUserListFailed'),
      });
    }
  };

  useEffect(() => {
    if (currentUser.userId) {
      fetchUsers();
    }
  }, [currentUser.userId, token]);

  useEffect(() => {
    if (stompClient && currentUser.email && isConnected) {
      const messageSubscription = stompClient.subscribe(
        `/user/${currentUser.email}/chat`,
        (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log("Tin nhắn nhận được:", receivedMessage);
          if (
            selectedUser &&
            (receivedMessage.senderEmail === selectedUser.email ||
              receivedMessage.recipientEmail === selectedUser.email)
          ) {
            setMessages((prev) => {
              const messageKey = `${receivedMessage.timestamp}_${
                receivedMessage.senderEmail
              }_${receivedMessage.mediaUrl || ""}`;
              if (
                prev.some(
                  (msg) =>
                    `${msg.timestamp}_${msg.senderEmail}_${
                      msg.mediaUrl || ""
                    }` === messageKey
                )
              ) {
                console.log("Duplicate message ignored:", messageKey);
                return prev;
              }
              console.log("Adding message to state:", receivedMessage);
              return [...prev, receivedMessage];
            });
          }
          if (
            !isOpen ||
            (selectedUser?.email !== receivedMessage.senderEmail &&
              receivedMessage.senderEmail !== currentUser.email)
          ) {
            setUnreadCounts((prev) => ({
              ...prev,
              [receivedMessage.senderEmail]:
                (prev[receivedMessage.senderEmail] || 0) + 1,
            }));
          }
        }
      );

      const typingSubscription = stompClient.subscribe(
        `/user/${currentUser.email}/typing`,
        (message) => {
          const typingData = JSON.parse(message.body);
          console.log("Trạng thái gõ:", typingData);
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
  }, [stompClient, currentUser.email, selectedUser, isOpen, isConnected]);

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
          console.log("Lịch sử chat:", response.data);
          setMessages(response.data);
          setUnreadCounts((prev) => ({
            ...prev,
            [selectedUser.email]: 0,
          }));
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

  const scrollToBottom = () => {
    console.log("Calling scrollToBottom");
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn("messagesEndRef is not set");
    }
  };

  useEffect(() => {
    console.log("Messages updated, scrolling to bottom:", messages.length);
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("File type:", file.type);
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
      console.log("Content type:", contentType);

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
      setTimeout(scrollToBottom, 0);
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
      console.log("Gửi tin nhắn:", messageDTO);
      stompClient.send("/app/chat", {}, JSON.stringify(messageDTO));
      setMessages((prev) => [...prev, messageDTO]);
      setInputMessage("");
      setShowEmojiPicker(false);
      setTimeout(scrollToBottom, 0);
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

  const renderMessageContent = (msg) => {
    if (!msg || !msg.contentType) {
      console.error("Invalid message:", msg);
      return <p className="text-red-500">{t('messages.invalidMessage')}</p>;
    }
    try {
      if (msg.contentType === "IMAGE") {
        if (!msg.mediaUrl) {
          console.error("Missing mediaUrl for IMAGE:", msg);
          return <p className="text-red-500">{t('messages.noImageUrl')}</p>;
        }
        const imageUrl = getCloudinaryUrl(msg.mediaUrl, "IMAGE");
        return (
          <img
            src={imageUrl}
            alt="media"
            className="max-w-[150px] rounded cursor-pointer"
            onClick={() => openPreview(msg.mediaUrl, "IMAGE")}
            onError={(e) => {
              console.error(`Failed to load image: ${imageUrl}`);
              e.target.replaceWith(
                <span className="text-red-500">{t('messages.imageLoadFailed')}</span>
              );
            }}
            onLoad={() => console.log("Image loaded:", imageUrl)}
          />
        );
      }
      if (msg.contentType === "VIDEO") {
        const videoUrl = getCloudinaryUrl(msg.mediaUrl, "VIDEO");
        return (
          <video
            controls
            className="max-w-[150px] rounded cursor-pointer"
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
      console.warn("Unknown contentType:", msg.contentType);
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
    <div className="fixed z-50 bottom-5 right-5">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-16 h-16 text-white transition-colors duration-200 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
            <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
              {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
      )}
      {isOpen && (
        <div className="flex flex-col bg-white rounded-lg shadow-xl w-80 h-96">
          <div className="flex items-center justify-between p-4 text-white bg-blue-500 rounded-t-lg">
            <h3 className="font-semibold">{t('chatBubble.title')}</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                 onClose?.();
              }}
              className="text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {!selectedUser ? (
            <div className="flex-1 overflow-y-auto">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center p-3 transition-colors duration-200 cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">
                      {user.name[0]}
                    </div>
                    <div className="flex-1 ml-2">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    {unreadCounts[user.email] > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
                        {unreadCounts[user.email]}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="p-3 text-sm text-gray-500">
                  {t('chatBubble.noChatHistory')}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center p-3 bg-gray-100">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="mr-2 text-blue-500"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">
                  {selectedUser.name[0]}
                </div>
                <p className="ml-2 font-medium">{selectedUser.name}</p>
              </div>
              <div
                className="flex-1 p-3 overflow-y-auto bg-gray-50"
                style={{ maxHeight: "calc(100% - 120px)" }}
              >
                {messages.map((msg, index) => (
                  <div
                    key={`${msg.timestamp}_${msg.senderEmail}_${index}`}
                    className={`mb-2 flex ${
                      msg.senderEmail === currentUser.email
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-2 rounded-lg ${
                        msg.senderEmail === currentUser.email
                          ? "bg-blue-500 text-white"
                          : msg.isRead
                          ? "bg-white text-gray-800 border border-gray-200"
                          : "bg-gray-200 text-gray-800 border border-gray-300 font-semibold"
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
                  <div className="text-sm text-gray-500">{t('chatBubble.typing')}</div>
                )}
                <div ref={messagesEndRef} style={{ height: "1px" }} />
              </div>
              <div className="relative p-3 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
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
                    placeholder={t('chatBubble.messagePlaceholder')}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[13px]"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-3 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    <IoSend />
                  </button>
                </div>
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full right-0 mb-2 w-[370px] max-h-[350px] overflow-y-auto bg-white shadow-lg rounded-lg z-50 text-[12px]"
                  >
                    <Picker
                      onEmojiClick={(emojiObject) => {
                        console.log("Emoji selected:", emojiObject.emoji);
                        setInputMessage((prev) => prev + emojiObject.emoji);
                        setShowEmojiPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
              <MediaPreviewModal
                isOpen={isPreviewOpen}
                onClose={closePreview}
                mediaUrl={previewMedia.url}
                contentType={previewMedia.type}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;