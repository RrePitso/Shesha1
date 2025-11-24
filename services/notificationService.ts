import { getMessaging, getToken } from "firebase/messaging";
import { database } from "../firebase";
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
        // Save the token to the database under the user's ID
        const tokenRef = ref(database, `fcmTokens/${userId}`);
        await set(tokenRef, { token });
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
  }
};
