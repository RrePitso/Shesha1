"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onorderstatuschange = void 0;
const database_1 = require("firebase-functions/v2/database");
const admin = require("firebase-admin");
const messaging_1 = require("firebase-admin/messaging");
admin.initializeApp();
const db = admin.database();
exports.onorderstatuschange = (0, database_1.onValueUpdated)("/orders/{orderId}/status", async (event) => {
    const orderId = event.params.orderId;
    const newStatus = event.data.after.val();
    console.log(`[${orderId}] Starting execution for status change to: ${newStatus}`);
    const orderSnap = await db.ref(`/orders/${orderId}`).once("value");
    const order = orderSnap.val();
    if (!order) {
        console.error(`[${orderId}] Critical Error: Order data not found after status update.`);
        return;
    }
    const userIds = [];
    if (order.customerId)
        userIds.push(order.customerId);
    if (order.driverId)
        userIds.push(order.driverId);
    if (order.restaurantId)
        userIds.push(order.restaurantId);
    if (userIds.length === 0) {
        console.log(`[${orderId}] No users (customer, driver, restaurant) associated with this order. Exiting.`);
        return;
    }
    console.log(`[${orderId}] Identified users for notification:`, userIds);
    const tokens = [];
    for (const userId of userIds) {
        try {
            const tokenSnap = await db.ref(`/fcmTokens/${userId}/token`).once("value");
            const token = tokenSnap.val();
            if (token) {
                console.log(`[${orderId}] Found token for user ${userId}: ${token.substring(0, 20)}...`);
                tokens.push(token);
            }
            else {
                console.warn(`[${orderId}] No FCM token found for user: ${userId}`);
            }
        }
        catch (err) {
            console.error(`[${orderId}] Error fetching token for user ${userId}:`, err);
        }
    }
    if (tokens.length === 0) {
        console.error(`[${orderId}] No valid FCM tokens could be found for any of the ${userIds.length} users. Cannot send notification.`);
        return;
    }
    const message = {
        notification: {
            title: "Order Status Update",
            body: `Your order status has been updated to: ${newStatus}`,
        },
        tokens: tokens,
    };
    console.log(`[${orderId}] Attempting to send notification to ${tokens.length} device(s). Payload:`, JSON.stringify(message.notification));
    try {
        const response = await (0, messaging_1.getMessaging)().sendEachForMulticast(message);
        console.log(`[${orderId}] Successfully sent message. ${response.successCount} messages were sent successfully.`);
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                    console.error(`[${orderId}] Failure sending to token ${tokens[idx]}:`, resp.error);
                }
            });
            console.log(`[${orderId}] List of tokens that caused failures: ${failedTokens.join(', ')}`);
        }
    }
    catch (error) {
        console.error(`[${orderId}] CRITICAL: The entire 'sendEachForMulticast' operation failed:`, error);
    }
});
//# sourceMappingURL=index.js.map