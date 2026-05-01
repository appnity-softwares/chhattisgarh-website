import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from '@/lib/firebase';
import apiService from '@/lib/api.service';
import apiConfig from '@/lib/api.config';
import { useUserAuthStore } from '@/stores/user-auth-store';

export function usePushNotifications() {
    const [token, setToken] = useState<string | null>(null);
    const { accessToken } = useUserAuthStore();

    useEffect(() => {
        if (!accessToken || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        const requestPermission = async () => {
            try {
                const vapidKey = apiConfig.vapidKey;
                // Skip if no VAPID key or if it's the placeholder dummy key
                if (!vapidKey || vapidKey.includes('-0-0-0-')) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Push notifications skipped: No valid VAPID key configured');
                    }
                    return;
                }

                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const messaging = getMessaging(app);
                    const currentToken = await getToken(messaging, {
                        vapidKey: vapidKey,
                    });

                    if (currentToken) {
                        setToken(currentToken);
                        // Register token with backend
                        await apiService.post(apiConfig.endpoints.notifications.registerDevice, {
                            token: currentToken,
                            platform: 'WEB'
                        });
                        console.log('Push notification token registered');
                    }
                }
            } catch (error) {
                console.error('Error setting up push notifications:', error);
            }
        };

        requestPermission();

        const messaging = getMessaging(app);
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Message received in foreground: ', payload);
            // Optionally show a toast here if not already handled by socket
        });

        return () => unsubscribe();
    }, [accessToken]);

    return { token };
}
