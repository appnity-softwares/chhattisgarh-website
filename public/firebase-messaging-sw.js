// Firebase Cloud Messaging Service Worker
// Handles background push notifications for the web app

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message: ', payload);

    const notificationTitle = payload.data?.title || 'New Message';
    const notificationOptions = {
        body: payload.data?.body || 'You have a new message',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.data?.tag || 'default',
        data: payload.data,
        requireInteraction: payload.data?.requireInteraction || false,
        actions: payload.data?.actions || []
    };

    // Show notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle foreground messages (when app is open)
messaging.onMessage((payload) => {
    console.log('Received foreground message: ', payload);
    
    // Send message to all clients
    const channel = new BroadcastChannel('firebase-messages');
    channel.postMessage(payload);
});

// Handle token refresh
messaging.onTokenRefresh((newToken) => {
    console.log('Token refreshed:', newToken);
    
    // Send new token to server
    fetch('/api/fcm-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: newToken }),
    }).catch(err => {
        console.error('Failed to send token to server:', err);
    });
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    
    const notification = event.notification;
    const data = notification.data;
    
    // Handle different notification types
    if (data?.type === 'message') {
        // Open chat screen
        event.waitUntil(
            clients.openWindow('/dashboard/chat')
        );
    } else if (data?.type === 'match') {
        // Open matches screen
        event.waitUntil(
            clients.openWindow('/dashboard/matches')
        );
    } else if (data?.type === 'contact_request') {
        // Open contact requests screen
        event.waitUntil(
            clients.openWindow('/dashboard/contact-requests')
        );
    } else {
        // Default: open dashboard
        event.waitUntil(
            clients.openWindow('/dashboard')
        );
    }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event);
});
