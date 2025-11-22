/* eslint-disable no-undef */
/* global self, importScripts, firebase */

importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// NOTE: put the SAME config values you used in .env here (hard-coded)
firebase.initializeApp({
  apiKey: "AIzaSyAHBwjZwJt1yyHsNXsXfHj2QHMgvR49p6A",
  authDomain: "mendly-15e34.firebaseapp.com",
  projectId: "mendly-15e34",
  messagingSenderId: "124689992024",
  appId: "1:124689992024:web:9948afb541d7e2aae17d2d",
});

const messaging = firebase.messaging();

// Show notification when app is in background
messaging.onBackgroundMessage(function (payload) {
  const title = payload.notification?.title || "Mendly check-in";
  const options = {
    body: payload.notification?.body || "",
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});

// When user taps on notification – focus or open the app
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const urlToOpen = "/";

        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
