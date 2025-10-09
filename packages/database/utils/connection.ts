// packages/database/utils/connection.ts
import mongoose from 'mongoose';

interface ConnectionConfig {
  uri: string;
  options?: mongoose.ConnectOptions;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private connections: Map<string, mongoose.Connection> = new Map();
  private isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect(config: ConnectionConfig): Promise<mongoose.Connection> {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      console.log('📊 Already connected to MongoDB');
      return mongoose.connection;
    }

    try {
      const options: mongoose.ConnectOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority',
        ...config.options,
      };

      await mongoose.connect(config.uri, options);
      
      this.isConnected = true;
      console.log('📊 Connected to MongoDB successfully');
      console.log(`📍 Database: ${mongoose.connection.name}`);
      console.log(`🌍 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

      this.setupEventListeners();
      
      return mongoose.connection;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    mongoose.connection.on('connected', () => {
      console.log('📊 Mongoose connected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📊 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await this.disconnect();
        console.log('📊 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
    }
  }

  getConnection(): mongoose.Connection {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return mongoose.connection;
  }

  isReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();

// Helper functions
export async function connectToDatabase(uri?: string): Promise<mongoose.Connection> {
  const mongoUri = uri || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  return dbManager.connect({ uri: mongoUri });
}

export function getDbConnection(): mongoose.Connection {
  return dbManager.getConnection();
}

export async function disconnectFromDatabase(): Promise<void> {
  return dbManager.disconnect();
}

export function isDatabaseReady(): boolean {
  return dbManager.isReady();
}