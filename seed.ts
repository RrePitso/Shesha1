
import { db } from './services/firebase';
import { ref, set } from 'firebase/database';
import { RESTAURANT_DATA, DRIVER_DATA, CUSTOMER_DATA } from './constants';

async function seedDatabase() {
  try {
    await set(ref(db, 'restaurants'), RESTAURANT_DATA);
    await set(ref(db, 'drivers'), DRIVER_DATA);
    await set(ref(db, 'customer'), CUSTOMER_DATA);
    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
