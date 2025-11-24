
import { onValueUpdated } from "firebase-functions/v2/database";
import * as admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

admin.initializeApp();

const db = admin.database();
const firestore = admin.firestore();

// Helper to fetch user data (including email) based on their role and ID
const getUserData = async (userId: string, role: string): Promise<{email: string | null, fcmToken: string | null}> => {
    try {
        const userSnap = await db.ref(`/${role}s/${userId}`).once("value");
        const userData = userSnap.val();
        const email = userData?.email || null;

        const tokenSnap = await db.ref(`/fcmTokens/${userId}`).once("value");
        const fcmToken = tokenSnap.val()?.token || null;
        
        console.log(`Data for ${role} ${userId}: Email=${email}, Token=${fcmToken ? "Found" : "Not Found"}`);
        return { email, fcmToken };
    } catch (err) {
        console.error(`Error fetching data for ${role} ${userId}:`, err);
        return { email: null, fcmToken: null };
    }
};

export const onorderstatuschange = onValueUpdated("/orders/{orderId}/status", async (event) => {
    const orderId = event.params.orderId;
    const newStatus = event.data.after.val();

    console.log(`[${orderId}] Status changed to: ${newStatus}. Initiating notifications.`);

    const orderSnap = await db.ref(`/orders/${orderId}`).once("value");
    const order = orderSnap.val();

    if (!order) {
        console.error(`[${orderId}] Critical Error: Order data not found.`);
        return;
    }

    const userPromises: Promise<{email: string | null, fcmToken: string | null}>[] = [];
    if (order.customerId) userPromises.push(getUserData(order.customerId, "customer"));
    if (order.driverId) userPromises.push(getUserData(order.driverId, "driver"));
    if (order.restaurantId) userPromises.push(getUserData(order.restaurantId, "restaurant"));

    if (userPromises.length === 0) {
        console.log(`[${orderId}] No users associated with this order. Exiting.`);
        return;
    }

    const userData = await Promise.all(userPromises);
    const emails = userData.map(u => u.email).filter((e): e is string => e !== null);
    const tokens = userData.map(u => u.fcmToken).filter((t): t is string => t !== null);

    // --- Email Logic ---
    if (emails.length > 0) {
        const emailPayload = {
            to: emails,
            message: {
              subject: `Order Update: ${orderId}`,
              text: `The status of your order #${orderId} has been updated to: ${newStatus}`,
              html: `<p>The status of your order #${orderId} has been updated to: <strong>${newStatus}</strong></p>`,
            },
        };
        try {
            const writeResult = await firestore.collection("mail").add(emailPayload);
            console.log(`[${orderId}] Successfully staged email to ${emails.length} recipients (Firestore ID: ${writeResult.id})`);
        } catch (error) {
            console.error(`[${orderId}] CRITICAL: Failed to write email document to Firestore:`, error);
        }
    } else {
        console.log(`[${orderId}] No emails found for this order.`);
    }

    // --- Push Notification Logic ---
    if (tokens.length > 0) {
        const pushPayload = {
            notification: {
                title: "Order Status Update",
                body: `Your order status is now: ${newStatus}`,
            },
            tokens: tokens,
        };
        try {
            const response = await getMessaging().sendEachForMulticast(pushPayload);
            console.log(`[${orderId}] Sent ${response.successCount} push notifications successfully.`);
            if (response.failureCount > 0) {
                console.warn(`[${orderId}] Failed to send ${response.failureCount} push notifications.`);
            }
        } catch (error) {
            console.error(`[${orderId}] CRITICAL: Failed to send push notifications:`, error);
        }
    } else {
        console.log(`[${orderId}] No FCM tokens found for this order.`);
    }
});
