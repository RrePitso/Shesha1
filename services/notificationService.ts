import { getMessaging, getToken } from "firebase/messaging";
import { database, auth } from "../firebase";
import { ref, set } from "firebase/database";

const VAPID_KEY = "BNe-UlqlBOuAYPY-3bDdoFRGwYMwAQNNQjA4fRT-7sxyANwer9er1j37GNuqru7on76xQSO0m-zUDVX3ZTKFWCQ";

export const requestPermissionAndToken = async (userId: string) => {
  const messaging = getMessaging();
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        console.log("FCM Token:", token);
        // Defensive: verify auth.currentUser matches userId before writing
        const currentUser = auth.currentUser;
        if (!currentUser || currentUser.uid !== userId) {
          console.warn('Auth mismatch or not fully signed in yet; skipping token write for', userId);
          return;
        }
        const tokenRef = ref(database, `fcmTokens/${userId}`);
        try {
          await set(tokenRef, { token });
        } catch (err) {
          // Log details but do not rethrow — prevents spinner / crash
          console.error('Failed to save FCM token to database:', err);
        }
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } else {
      console.log("Notification permission not granted:", permission);
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
  }
};
