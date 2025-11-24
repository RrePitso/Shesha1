import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.database();
const messaging = admin.messaging();

export const onOrderStatusChange = functions.database.ref("/orders/{orderId}/status")
    .onUpdate(async (change, context) => {
      const orderId = context.params.orderId;
      const newStatus = change.after.val();

      console.log(`[${orderId}] Starting execution for status change to: ${newStatus}`);

      const orderSnap = await db.ref(`/orders/${orderId}`).once("value");
      const order = orderSnap.val();

      if (!order) {
        console.error(`[${orderId}] Critical Error: Order data not found after status update.`);
        return;
      }

      const userIds: string[] = [];
      if (order.customerId) userIds.push(order.customerId);
      if (order.driverId) userIds.push(order.driverId);
      if (order.restaurantId) userIds.push(order.restaurantId);

      if (userIds.length === 0) {
        console.log(`[${orderId}] No users (customer, driver, restaurant) associated with this order. Exiting.`);
        return;
      }
      console.log(`[${orderId}] Identified users for notification:`, userIds);


      const tokens: string[] = [];
      for (const userId of userIds) {
        try {
            const tokenSnap = await db.ref(`/fcmTokens/${userId}/token`).once("value");
            const token = tokenSnap.val();
            if (token) {
              console.log(`[${orderId}] Found token for user ${userId}: ${token.substring(0, 20)}...`);
              tokens.push(token);
            } else {
              console.warn(`[${orderId}] No FCM token found for user: ${userId}`);
            }
        } catch (err) {
            console.error(`[${orderId}] Error fetching token for user ${userId}:`, err);
        }
      }

      if (tokens.length === 0) {
        console.error(`[${orderId}] No valid FCM tokens could be found for any of the ${userIds.length} users. Cannot send notification.`);
        return;
      }

      const payload = {
        notification: {
          title: "Order Status Update",
          body: `Your order status has been updated to: ${newStatus}`,
        },
      };

      console.log(`[${orderId}] Attempting to send notification to ${tokens.length} device(s). Payload:`, JSON.stringify(payload.notification));

      try {
        const response = await messaging.sendToDevice(tokens, payload);
        console.log(`[${orderId}] Successfully sent message. Response from FCM:`, JSON.stringify(response));

        response.results.forEach((result, index) => {
            if(result.error) {
                console.error(`[${orderId}] Failure sending to token ${tokens[index]}:`, result.error);
            }
        });

      } catch (error) {
        console.error(`[${orderId}] CRITICAL: The entire \`sendToDevice\` operation failed:`, error);
      }
    });
