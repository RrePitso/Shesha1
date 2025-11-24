import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { database } from '../firebase'; // Corrected import path
import { ref, set } from "firebase/database";
import { User } from 'firebase/auth';

const VAPID_KEY = "BDaA48-7JFS8I9aWkKaiWq1B_2I4h3i3j028s7V4An8yDJC3uYr4ouh21pCnoo2yD9pZfMfnzZRR524vj8rG1NQ";

// Initializes the messaging service and requests a token
export const requestPermissionAndToken = async (userId: string) => {
  const messaging = getMessaging();
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });
      if (currentToken) {
        // Save the token to the Realtime Database
        await set(ref(database, `fcmTokens/${userId}/token`), currentToken);
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

// --- New Function --- 
// Listens for messages when the app is in the foreground and displays them as toasts.
export const onForegroundMessage = (addToast: (message: string, type: 'success' | 'error') => void) => {
  const messaging = getMessaging();
  onMessage(messaging, (payload) => {
    console.log("Foreground message received: ", payload);
    if (payload.notification) {
      const { title, body } = payload.notification;
      // Combine title and body for a more informative toast message.
      addToast(`${title}: ${body}`, 'success');
    }
  });
};