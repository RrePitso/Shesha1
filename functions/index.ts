import { onValueUpdated } from "firebase-functions/v2/database";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

admin.initializeApp();

const db = admin.database();
const firestore = admin.firestore();

// --- CONFIGURATION ---
// Your provided AiSensy API Key
const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NzYzNmQ2MjM3MDVhMjk2OTE2ZDQwNyIsIm5hbWUiOiJpRGVsaXZlcnkiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjk3NjM2ZDYyMzcwNWEyOTY5MTZkNDAyIiwiYWN0aXZlUGxhbiI6IkZSRUVfRk9SRVZFUiIsImlhdCI6MTc2OTM1NDk2Nn0.bX0ZAAMOXAa_lU29uybzt0ir39-hthb_SQ4MMb1LdS4"; 

// --- HELPERS ---

// 1. Fetch User Data (Gets Name & Phone)
const getUserData = async (userId: string, role: string): Promise<{
    email: string | null, 
    fcmToken: string | null, 
    phoneNumber: string | null, 
    name: string 
}> => {
    try {
        const userSnap = await db.ref(`/${role}s/${userId}`).once("value");
        const userData = userSnap.val();
        
        const email = userData?.email || null;
        const name = userData?.name || "User"; 
        
        // Check for specific phone fields or fallback
        const phoneNumber = userData?.phoneNumber || userData?.paymentPhoneNumber || null;

        const tokenSnap = await db.ref(`/fcmTokens/${userId}`).once("value");
        const fcmToken = tokenSnap.val()?.token || null;
        
        return { email, fcmToken, phoneNumber, name };
    } catch (err) {
        console.error(`Error fetching data for ${role} ${userId}:`, err);
        return { email: null, fcmToken: null, phoneNumber: null, name: "User" };
    }
};

// 2. Generic AiSensy Sender
const sendAiSensyNotification = async (
    targetPhoneNumber: string, 
    templateName: string, 
    templateParams: string[]
) => {
    if (!targetPhoneNumber) return;

    // Ensure strictly 27... format if needed, but AiSensy is flexible with +27
    // This payload matches the AiSensy API requirement
    const payload = {
        apiKey: AISENSY_API_KEY,
        campaignName: templateName, 
        destination: targetPhoneNumber,
        userName: templateParams[0], // First param is usually the user's name
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
        console.log(`[AiSensy] Template '${templateName}' sent to ${targetPhoneNumber}:`, result);
    } catch (error) {
        console.error(`[AiSensy] Failed to send '${templateName}':`, error);
    }
};

// --- TRIGGERS ---

// 1. PARCEL TRIGGER (The Core Logic)
export const onparcelstatuschange = onValueUpdated("/parcels/{parcelId}/status", async (event) => {
    const parcelId = event.params.parcelId;
    const newStatus = event.data.after.val();
    const oldStatus = event.data.before.val();
    
    // Fetch Parcel Data
    const parcelSnap = await db.ref(`/parcels/${parcelId}`).once("value");
    const parcel = parcelSnap.val();
    if (!parcel) return;

    // Fetch Customer & Driver Data
    const customer = await getUserData(parcel.customerId, "customer");
    const driver = parcel.driverId ? await getUserData(parcel.driverId, "driver") : null;

    // --- SCENARIO 1: DRIVER ASSIGNED (Notify Customer) ---
    // Template: driver_assigned 
    // Params: {{1}}=CustName, {{2}}=DriverName, {{3}}=Link
    if (newStatus === 'Driver Assigned' && driver && customer.phoneNumber) {
        await sendAiSensyNotification(
            customer.phoneNumber,
            "driver_assigned",
            [
                customer.name, 
                driver.name, 
                "https://idelivery.co.za/app" 
            ]
        );
    }

    // --- SCENARIO 2: PAYMENT REQUESTED (Notify Customer) ---
    // Template: payment_request
    // Params: {{1}}=CustName, {{2}}=Amount, {{3}}=Link
    // Trigger: When driver sets the cost (Status becomes 'Pending Payment')
    if (newStatus === 'Pending Payment' && customer.phoneNumber) {
        const amount = (parcel.goodsCost || 0).toFixed(2); // e.g., "150.00"
        await sendAiSensyNotification(
            customer.phoneNumber,
            "payment_request",
            [
                customer.name, 
                amount, 
                "https://idelivery.co.za/app" 
            ]
        );
    }

    // --- SCENARIO 3: PAYMENT RECEIVED (Notify Driver) ---
    // Template: payment_received
    // Params: {{1}}=Amount, {{2}}=ParcelID
    // Trigger: When Customer clicks "I Have Paid" (Status becomes 'Awaiting Driver Confirmation')
    if (newStatus === 'Awaiting Driver Confirmation' && driver && driver.phoneNumber) {
        const amount = (parcel.goodsCost || 0).toFixed(2);
        await sendAiSensyNotification(
            driver.phoneNumber,
            "payment_received",
            [
                amount, 
                parcelId.slice(0, 6) 
            ]
        );
    }

    // --- PUSH NOTIFICATION BACKUP (Free & Unlimited) ---
    // Sends standard push notifications for ALL status changes (including Delivered)
    if (customer.fcmToken) {
        let body = `Status Update: ${newStatus}`;
        if (newStatus === 'Pending Payment') body = `Amount Set: R${parcel.goodsCost || 0}. Tap to pay.`;
        if (newStatus === 'Driver Assigned') body = `${driver?.name} is on the way!`;
        if (newStatus === 'Delivered') body = `Your parcel has been delivered. Thank you!`;
        
        await getMessaging().send({
            token: customer.fcmToken,
            notification: {
                title: "Parcel Update",
                body: body
            }
        });
    }
});

// 2. ORDER TRIGGER (Food Orders - Push Only)
export const onorderstatuschange = onValueUpdated("/orders/{orderId}/status", async (event) => {
    const orderId = event.params.orderId;
    const newStatus = event.data.after.val();
    
    const orderSnap = await db.ref(`/orders/${orderId}`).once("value");
    const order = orderSnap.val();
    if (!order) return;

    if (order.customerId) {
        const customer = await getUserData(order.customerId, "customer");
        if (customer.fcmToken) {
             await getMessaging().send({
                token: customer.fcmToken,
                notification: { title: "Order Update", body: `Your food order is: ${newStatus}` }
            });
        }
    }
});

// 3. Payment Verification Placeholder (Required to prevent deploy errors if referenced elsewhere)
export const verifyPaystackPayment = onCall({ cors: true }, async (request) => {
    // This is a stub since we are ignoring Paystack for now.
    return { success: true, message: "Paystack disabled." };
});