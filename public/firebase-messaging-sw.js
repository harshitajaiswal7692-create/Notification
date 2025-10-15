// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCDTjCyZXrh-UZlmRIyAkggFlXLX9ENTQI",
  authDomain: "localhost-f2730.firebaseapp.com",
  projectId: "localhost-f2730",
  storageBucket: "localhost-f2730.firebasestorage.app",
  messagingSenderId: "536657234345",
  appId: "1:536657234345:web:dd23e56a18f8bc1d4c1cb8",
  measurementId: "G-0TKQR2P41Z"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] 📩 Background message received:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://cat.10515.net/1.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
