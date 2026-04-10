import { io, Socket } from "socket.io-client";
import apiConfig from "./api.config";

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    connect(token: string) {
        if (this.socket?.connected) return;

        this.socket = io(apiConfig.socketUrl, {
            auth: { token },
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
        });

        this.socket.on("connect", () => {
            console.log("Socket Connected to:", apiConfig.socketUrl);
        });

        this.socket.on("disconnect", () => {
            console.log("Socket Disconnected");
        });

        this.socket.onAny((event: string, ...args: any[]) => {
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                eventListeners.forEach(listener => listener(...args));
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event: string, data: any) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn("Socket not connected. Cannot emit:", event);
        }
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: Function) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(callback);
            if (index !== -1) {
                eventListeners.splice(index, 1);
            }
        }
    }

    sendMessage(receiverId: number, content: string, contentType: 'TEXT' | 'IMAGE' = 'TEXT', clientMessageId?: string) {
        this.emit(apiConfig.socketEvents.MESSAGE_SEND, {
            receiverId,
            content,
            contentType,
            clientMessageId: clientMessageId || `web-${Date.now()}`
        });
    }

    sendTyping(receiverId: number, isTyping: boolean) {
        this.emit(isTyping ? apiConfig.socketEvents.TYPING_START : apiConfig.socketEvents.TYPING_STOP, { receiverId });
    }

    markAsRead(userId: number) {
        this.emit(apiConfig.socketEvents.MESSAGE_READ, { userId });
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
export default socketService;
