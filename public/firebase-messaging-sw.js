importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDM4sPgzRjDJ7S9Pms2Bbq1cnZ7vHTwiQk",
    authDomain: "chhattishgarh-shaadi.firebaseapp.com",
    projectId: "chhattishgarh-shaadi",
    storageBucket: "chhattishgarh-shaadi.firebasestorage.app",
    messagingSenderId: "114963250437",
    appId: "1:114963250437:web:c6a04efcbf44c4c22c54b6",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo-circle.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
