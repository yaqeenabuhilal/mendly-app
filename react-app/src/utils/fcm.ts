// react-app/src/utils/fcm.ts
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

let messagingPromise: Promise<Messaging> | null = null;

function getMessagingInstance(): Promise<Messaging> {
  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => {
      if (!supported) {
        throw new Error("Notifications are not supported in this browser.");
      }
      const app = initializeApp(firebaseConfig);
      return getMessaging(app);
    });
  }
  return messagingPromise;
}

/**
 * Ask for permission, then get FCM token.
 * Returns null if permission denied or not supported.
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    const messaging = await getMessagingInstance();

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted");
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
    const token = await getToken(
      messaging,
      vapidKey ? { vapidKey } : undefined
    );

    if (!token) {
      console.log("No FCM token returned.");
      return null;
    }

    console.log("FCM token:", token);
    return token;
  } catch (err) {
    console.error("Error getting FCM token:", err);
    return null;
  }
}

/**
 * Optional: handle messages while app is open (foreground)
 */
export function initForegroundMessaging() {
  getMessagingInstance()
    .then((messaging) => {
      onMessage(messaging, (payload) => {
        console.log("FCM foreground message:", payload);
        // here you could show a toast / popup if you like
      });
    })
    .catch((err) => {
      console.log("Foreground FCM disabled:", err);
    });
}
