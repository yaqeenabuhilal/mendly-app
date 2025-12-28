import { Capacitor } from "@capacitor/core";
import { AudioMonitor } from "../plugins/AudioMonitor";
import { LocalNotifications } from "@capacitor/local-notifications";

function isAndroidNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

async function ensureNotificationPermission() {
  try {
    const res = await LocalNotifications.requestPermissions();
    if ((res as any).display !== "granted") {
      console.warn("Notifications permission not granted.");
    }
  } catch {
    // ignore
  }
}

export async function startListening() {
  if (!isAndroidNative()) {
    alert("Voice monitoring works only in the Android app (not in the browser).");
    return;
  }

  await ensureNotificationPermission();

  // ✅ permission handled inside the native plugin start()
  await AudioMonitor.start();

  alert("Audio Monitor started (persistent notification will appear).");
}

export async function stopListening() {
  if (!isAndroidNative()) {
    alert("Voice monitoring works only in the Android app (not in the browser).");
    return;
  }

  await AudioMonitor.stop();
  alert("Audio Monitor stopped.");
}
