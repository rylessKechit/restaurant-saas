const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('📊 Already connected to MongoDB');
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    const options = {
      // Supprimé les options deprecated
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Nouvelles options recommandées
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(mongoUri, options);
    
    isConnected = true;
    console.log('📊 Connected to MongoDB successfully');
    
    // Log connection info
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🌍 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // En développement, on continue sans MongoDB pour tester
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing without MongoDB in development mode');
      return;
    }
    
    // En production, on exit
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB');
  isConnected = true;
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('📊 Mongoose disconnected from MongoDB');
  isConnected = false;
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📊 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

module.exports = {
  connectDB,
  isConnected: () => isConnected
};