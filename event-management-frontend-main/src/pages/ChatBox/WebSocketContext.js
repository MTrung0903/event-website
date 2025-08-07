import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef(null); // Lưu client hiện tại

    const CustomToast = ({ title, message }) => (
        <div>
            <strong>{title}</strong>
            <div>{message}</div>
        </div>
    );

    const connectWebSocket = () => {
        // Ngắt kết nối client cũ nếu tồn tại
        if (clientRef.current) {
            clientRef.current.disconnect(() => {
                console.log("Disconnected old WebSocket client");
            });
            clientRef.current = null;
        }

        const socket = new SockJS("http://localhost:8080/ws");
        const client = Stomp.over(socket);
        clientRef.current = client; // Lưu client mới
        const token = localStorage.getItem("token");
        let userId;

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                userId = payload.userId;
            } catch (e) {
                console.error("Error decoding token:", e);
            }
        }

        client.connect(
            {},
            () => {
                console.log("Connected to WebSocket");
                setIsConnected(true);
                if (userId) {
                    client.subscribe(`/user/${userId}/specific`, (message) => {
                        console.log(`Received on /user/${userId}/specific:`, message.body);
                        const parsedMessage = JSON.parse(message.body);
                        toast.info(
                            <CustomToast
                                title={parsedMessage.title || "Thông báo mới"}
                                message={parsedMessage.message || "Bạn có một thông báo mới!"}
                            />,
                            {
                                autoClose: 5000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                            }
                        );
                    });
                }
                setStompClient(client);
            },
            (error) => {
                console.error("WebSocket connection failed:", error);
                setIsConnected(false);
                toast.error("Mất kết nối đến server thông báo. Đang thử kết nối lại...");
                setTimeout(connectWebSocket, 5000); // Thử kết nối lại
            }
        );

        // Xử lý sự kiện đóng kết nối
        client.onWebSocketClose = () => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
            setTimeout(connectWebSocket, 5000); // Thử kết nối lại
        };
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (clientRef.current) {
                clientRef.current.disconnect(() => console.log("Disconnected from WebSocket"));
                clientRef.current = null;
            }
        };
    }, []); // Chỉ chạy một lần khi component mount

    return (
        <WebSocketContext.Provider value={{ stompClient, isConnected }}>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);