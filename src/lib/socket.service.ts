import { io, Socket } from "socket.io-client";
import apiConfig from "./api.config";

class SocketService {
    private socket: Socket | null = null;
    private isConnecting: boolean = false;
    private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();
    private reconnectTimer: NodeJS.Timeout | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 10;
    private baseReconnectDelay: number = 3000; // 3 seconds
    private currentToken: string | null = null;
    private visibilityHandler: (() => void) | null = null;
    private isDestroyed: boolean = false;

    connect(token: string) {
        if (this.isDestroyed || this.socket?.connected || this.isConnecting) return;

        this.currentToken = token;
        this.isConnecting = true;
        this.socket = io(apiConfig.socketUrl, {
            auth: { token },
            transports: ["websocket"],
            reconnection: false, // We handle reconnection manually
        });

        // Setup visibility and network change handlers
        this.setupVisibilityHandler();
        this.setupNetworkHandlers();

        this.socket.on("connect", () => {
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            console.log("Socket Connected to:", apiConfig.socketUrl);
        });

        this.socket.on("connect_error", (error) => {
            this.isConnecting = false;
            console.error("Socket Connection Error:", error);
        });

        this.socket.on("disconnect", (reason) => {
            console.log("Socket Disconnected. Reason:", reason);
            // If not intentional disconnect, attempt manual reconnect with backoff
            if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
                this.attemptManualReconnect();
            }
        });

        this.socket.on("reconnect", (attemptNumber) => {
            console.log("Socket Reconnected after", attemptNumber, "attempts");
        });

        this.socket.on("reconnect_attempt", (attemptNumber) => {
            console.log("Socket Reconnect attempt:", attemptNumber);
        });

        this.socket.on("reconnect_error", (error) => {
            console.error("Socket Reconnect Error:", error);
        });

        this.socket.on("reconnect_failed", () => {
            console.error("Socket Reconnect Failed after all attempts");
        });

        this.socket.onAny((event: string, ...args: unknown[]) => {
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                eventListeners.forEach(listener => listener(...args));
            }
        });
    }

    private setupVisibilityHandler() {
        // Remove existing handler if any
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
        }

        this.visibilityHandler = () => {
            if (!document.hidden && this.currentToken && !this.socket?.connected) {
                // App came to foreground and socket is disconnected
                console.log('App came to foreground, reconnecting socket...');
                this.reconnectAttempts = 0; // Reset attempts for foreground reconnection
                this.connect(this.currentToken);
            }
        };

        document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    private setupNetworkHandlers() {
        const handleOnline = () => {
            if (this.currentToken && !this.socket?.connected) {
                console.log('Network back online, reconnecting socket...');
                this.reconnectAttempts = 0;
                this.connect(this.currentToken);
            }
        };

        window.addEventListener('online', handleOnline);
    }

    private attemptManualReconnect() {
        if (this.isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("Max manual reconnect attempts reached");
            return;
        }

        // Clear any existing timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        this.reconnectAttempts++;
        // Exponential backoff: 3s, 6s, 12s, 24s, max 30s
        const delay = Math.min(
            this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            30000
        );

        console.log(`Manual reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            if (!this.socket?.connected && this.currentToken && !this.isDestroyed) {
                this.connect(this.currentToken);
            }
        }, delay);
    }

    disconnect() {
        this.isConnecting = false;
        this.currentToken = null;
        // Clear any pending reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        // Remove visibility handler
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            this.visibilityHandler = null;
        }
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    destroy() {
        this.isDestroyed = true;
        this.disconnect();
        this.listeners.clear();
    }

    emit(event: string, data: unknown) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn("Socket not connected. Cannot emit:", event);
        }
    }

    on(event: string, callback: (...args: unknown[]) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: (...args: unknown[]) => void) {
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
