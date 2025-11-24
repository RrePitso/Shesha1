import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.database();
const messaging = admin.messaging();

export const onOrderStatusChange = functions.database.ref("/orders/{orderId}/status")
    .onUpdate(async (change, context) => {
      const orderId = context.params.orderId;
      const newStatus = change.after.val();

      console.log(`Order ${orderId} status changed to ${newStatus}`);

      const orderSnap = await db.ref(`/orders/${orderId}`).once("value");
      const order = orderSnap.val();

      if (!order) {
        console.log("Order not found");
        return;
      }

      let userIds: string[] = [];
      if (order.customerId) userIds.push(order.customerId);
      if (order.driverId) userIds.push(order.driverId);
      if (order.restaurantId) userIds.push(order.restaurantId);

      const tokens: string[] = [];
      for (const userId of userIds) {
        const tokenSnap = await db.ref(`/fcmTokens/${userId}/token`).once("value");
        const token = tokenSnap.val();
        if (token) {
          tokens.push(token);
        }
      }

      if (tokens.length === 0) {
        console.log("No FCM tokens found for the users involved in this order.");
        return;
      }

      const payload = {
        notification: {
          title: "Order Status Update",
          body: `Your order status has been updated to: ${newStatus}`,
        },
      };

      try {
        const response = await messaging.sendToDevice(tokens, payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
