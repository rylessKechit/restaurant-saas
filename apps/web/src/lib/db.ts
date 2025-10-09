import { connectToDatabase } from '@restaurant-saas/database';

let isConnected = false;

export async function initDB() {
  if (isConnected) {
    return;
  }

  try {
    await connectToDatabase(process.env.MONGODB_URI);
    isConnected = true;
    console.log('📊 Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function getDB() {
  if (!isConnected) {
    await initDB();
  }
  return;
}