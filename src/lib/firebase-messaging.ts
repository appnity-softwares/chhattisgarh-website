import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { onBackgroundMessage } from 'firebase/messaging/sw';

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted');
            return true;
        } else {
            console.warn('Notification permission denied');
            return false;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

// Get FCM token
export async function getFCMToken(): Promise<string | null> {
    try {
        // Ensure service worker is registered
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service worker registered:', registration);
        }

        const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (currentToken) {
            console.log('FCM Token:', currentToken);
            return currentToken;
        } else {
            console.warn('No FCM token available');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}

// Send token to backend
export async function sendTokenToBackend(token: string): Promise<void> {
    try {
        const response = await fetch('/api/fcm-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            throw new Error('Failed to send token to backend');
        }

        const data = await response.json();
        console.log('Token sent to backend:', data);
    } catch (error) {
        console.error('Error sending token to backend:', error);
    }
}

// Initialize notifications
export async function initializeNotifications() {
    try {
        // Request permission first
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            return;
        }

        // Get token
        const token = await getFCMToken();
        if (token) {
            await sendTokenToBackend(token);
        }

        // Handle foreground messages
        const unsubscribe = onMessage(messaging, (payload: unknown) => {
            console.log('Received foreground message:', payload);
            
            // Show notification for messages
            if (payload.data?.type === 'message') {
                const notification = new Notification(payload.data.title || 'New Message', {
                    body: payload.data.body || 'You have a new message',
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: `message-${payload.data.messageId}`,
                    data: payload.data,
                });

                notification.onclick = () => {
                    // Focus on chat window
                    window.focus();
                    window.open('/dashboard/chat', '_blank');
                };

                // Auto-close after 5 seconds
                setTimeout(() => {
                    notification.close();
                }, 5000);
            }

            // Show notification for match requests
            if (payload.data?.type === 'match') {
                const notification = new Notification(payload.data.title || 'New Interest', {
                    body: payload.data.body || 'Someone is interested in your profile',
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: `match-${payload.data.matchId}`,
                    data: payload.data,
                });

                notification.onclick = () => {
                    window.focus();
                    window.open('/dashboard/matches', '_blank');
                };

                setTimeout(() => {
                    notification.close();
                }, 5000);
            }

            // Show notification for contact requests
            if (payload.data?.type === 'contact_request') {
                const notification = new Notification(payload.data.title || 'Contact Request', {
                    body: payload.data.body || 'Someone requested your contact',
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: `contact-${payload.data.requestId}`,
                    data: payload.data,
                });

                notification.onclick = () => {
                    window.focus();
                    window.open('/dashboard/contact-requests', '_blank');
                };

                setTimeout(() => {
                    notification.close();
                }, 5000);
            }
        });

        // Handle background messages
        onBackgroundMessage(messaging, (payload: unknown) => {
            console.log('Received background message:', payload);
        });

        // Cleanup on unmount
        return unsubscribe;
    } catch (error) {
        console.error('Error initializing notifications:', error);
    }
}

// Clean up token on logout
export async function cleanupNotifications() {
    try {
        await deleteToken(messaging);
        console.log('FCM token deleted');
    } catch (error) {
        console.error('Error cleaning up notifications:', error);
    }
}

export { messaging, app };
