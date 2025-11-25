
import { updateOrder } from './services/databaseService.ts';

async function updateAndExit() {
  try {
    console.log("Attempting to update order status...");
    await updateOrder('-OeqvTu6hwOG3okYRm2e', { status: 'DRIVER_ASSIGNED' });
    console.log("Order status updated successfully!");
  } catch (error) {
    console.error("Failed to update order status:", error);
  }
}

updateAndExit();
