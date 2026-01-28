"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onorderstatuschange = exports.onparcelstatuschange = void 0;
const database_1 = require("firebase-functions/v2/database");
const admin = require("firebase-admin");
const messaging_1 = require("firebase-admin/messaging");
admin.initializeApp();
const db = admin.database();
const firestore = admin.firestore();
// --- CONFIGURATION ---
const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NzYzNmQ2MjM3MDVhMjk2OTE2ZDQwNyIsIm5hbWUiOiJpRGVsaXZlcnkiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjk3NjM2ZDYyMzcwNWEyOTY5MTZkNDAyIiwiYWN0aXZlUGxhbiI6IkZSRUVfRk9SRVZFUiIsImlhdCI6MTc2OTM1NDk2Nn0.bX0ZAAMOXAa_lU29uybzt0ir39-hthb_SQ4MMb1LdS4";
// --- HELPERS ---
// 1. Fetch User Data (Updated to include Phone Number)
const getUserData = async (userId, role) => {
    var _a;
    try {
        const userSnap = await db.ref(`/${role}s/${userId}`).once("value");
        const userData = userSnap.val();
        const email = (userData === null || userData === void 0 ? void 0 : userData.email) || null;
        const name = (userData === null || userData === void 0 ? void 0 : userData.name) || "User";
        // Check for specific phone fields or fallback
        const phoneNumber = (userData === null || userData === void 0 ? void 0 : userData.phoneNumber) || (userData === null || userData === void 0 ? void 0 : userData.paymentPhoneNumber) || null;
        const tokenSnap = await db.ref(`/fcmTokens/${userId}`).once("value");
        const fcmToken = ((_a = tokenSnap.val()) === null || _a === void 0 ? void 0 : _a.token) || null;
        return { email, fcmToken, phoneNumber, name };
    }
    catch (err) {
        console.error(`Error fetching data for ${role} ${userId}:`, err);
        return { email: null, fcmToken: null, phoneNumber: null, name: "User" };
    }
};
// 2. Generic AiSensy Sender (With 0 -> 27 Fix)
const sendAiSensyNotification = async (targetPhoneNumber, templateName, templateParams) => {
    if (!targetPhoneNumber)
        return;
    // --- PHONE NUMBER NORMALIZATION ---
    let cleanNumber = targetPhoneNumber.replace(/[\s-]/g, '');
    if (cleanNumber.startsWith('0')) {
        cleanNumber = '27' + cleanNumber.substring(1);
    }
    if (cleanNumber.startsWith('+')) {
        cleanNumber = cleanNumber.substring(1);
    }
    console.log(`[AiSensy] Sending to: ${cleanNumber} (Template: ${templateName})`);
    const payload = {
        apiKey: AISENSY_API_KEY,
        campaignName: templateName,
        destination: cleanNumber,
        userName: templateParams[0],
        templateParams: templateParams,
        media: {}
    };
    try {
        const response = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        console.log(`[AiSensy] Result:`, result);
    }
    catch (error) {
        console.error(`[AiSensy] Failed to send:`, error);
    }
};
// --- TRIGGERS ---
// 1. PARCEL TRIGGER (New WhatsApp Logic)
exports.onparcelstatuschange = (0, database_1.onValueUpdated)("/parcels/{parcelId}/status", async (event) => {
    const parcelId = event.params.parcelId;
    const newStatus = event.data.after.val();
    // Fetch Parcel Data
    const parcelSnap = await db.ref(`/parcels/${parcelId}`).once("value");
    const parcel = parcelSnap.val();
    if (!parcel)
        return;
    // Fetch Customer & Driver Data
    const customer = await getUserData(parcel.customerId, "customer");
    const driver = parcel.driverId ? await getUserData(parcel.driverId, "driver") : null;
    // --- WHATSAPP SCENARIOS ---
    // A. Driver Assigned
    if (newStatus === 'Driver Assigned' && driver && customer.phoneNumber) {
        await sendAiSensyNotification(customer.phoneNumber, "driver_assigned", [customer.name, driver.name, "https://idelivery.co.za/app"]);
    }
    // B. Payment Requested
    if (newStatus === 'Pending Payment' && customer.phoneNumber) {
        const amount = (parcel.goodsCost || 0).toFixed(2);
        await sendAiSensyNotification(customer.phoneNumber, "payment_request", [customer.name, amount, "https://idelivery.co.za/app"]);
    }
    // C. Payment Received
    if (newStatus === 'Awaiting Driver Confirmation' && driver && driver.phoneNumber) {
        const amount = (parcel.goodsCost || 0).toFixed(2);
        await sendAiSensyNotification(driver.phoneNumber, "payment_received", [amount, parcelId.slice(0, 6)]);
    }
    // --- PUSH NOTIFICATION BACKUP ---
    if (customer.fcmToken) {
        let body = `Status Update: ${newStatus}`;
        if (newStatus === 'Pending Payment')
            body = `Amount Set: R${parcel.goodsCost || 0}. Tap to pay.`;
        await (0, messaging_1.getMessaging)().send({
            token: customer.fcmToken,
            notification: { title: "Parcel Update", body: body }
        });
    }
});
// 2. ORDER TRIGGER (RESTORED FULL LOGIC)
exports.onorderstatuschange = (0, database_1.onValueUpdated)("/orders/{orderId}/status", async (event) => {
    const orderId = event.params.orderId;
    const newStatus = event.data.after.val();
    console.log(`[${orderId}] Order Status changed to: ${newStatus}`);
    const orderSnap = await db.ref(`/orders/${orderId}`).once("value");
    const order = orderSnap.val();
    if (!order) {
        console.error(`[${orderId}] Order data not found.`);
        return;
    }
    // Fetch ALL users involved
    const userPromises = [];
    if (order.customerId)
        userPromises.push(getUserData(order.customerId, "customer"));
    if (order.driverId)
        userPromises.push(getUserData(order.driverId, "driver"));
    if (order.restaurantId)
        userPromises.push(getUserData(order.restaurantId, "restaurant"));
    if (userPromises.length === 0)
        return;
    const userDataList = await Promise.all(userPromises);
    const emails = userDataList.map(u => u.email).filter(e => e !== null);
    const tokens = userDataList.map(u => u.fcmToken).filter(t => t !== null);
    // --- Restore Email Logic ---
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
            await firestore.collection("mail").add(emailPayload);
            console.log(`[${orderId}] Email queued for ${emails.length} recipients.`);
        }
        catch (error) {
            console.error(`[${orderId}] Failed to queue email:`, error);
        }
    }
    // --- Restore Push Notification Logic ---
    if (tokens.length > 0) {
        const pushPayload = {
            notification: {
                title: "Order Status Update",
                body: `Your order status is now: ${newStatus}`,
            },
            tokens: tokens,
        };
        try {
            const response = await (0, messaging_1.getMessaging)().sendEachForMulticast(pushPayload);
            console.log(`[${orderId}] Push sent. Success: ${response.successCount}`);
        }
        catch (error) {
            console.error(`[${orderId}] Push failed:`, error);
        }
    }
});
//# sourceMappingURL=index.js.map