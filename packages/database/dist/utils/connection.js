"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbManager = void 0;
exports.connectToDatabase = connectToDatabase;
exports.getDbConnection = getDbConnection;
exports.disconnectFromDatabase = disconnectFromDatabase;
exports.isDatabaseReady = isDatabaseReady;
// packages/database/utils/connection.ts
const mongoose_1 = __importDefault(require("mongoose"));
class DatabaseManager {
    constructor() {
        this.connections = new Map();
        this.isConnected = false;
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async connect(config) {
        if (this.isConnected && mongoose_1.default.connection.readyState === 1) {
            console.log('📊 Already connected to MongoDB');
            return mongoose_1.default.connection;
        }
        try {
            const options = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                retryWrites: true,
                w: 'majority',
                ...config.options,
            };
            await mongoose_1.default.connect(config.uri, options);
            this.isConnected = true;
            console.log('📊 Connected to MongoDB successfully');
            console.log(`📍 Database: ${mongoose_1.default.connection.name}`);
            console.log(`🌍 Host: ${mongoose_1.default.connection.host}:${mongoose_1.default.connection.port}`);
            this.setupEventListeners();
            return mongoose_1.default.connection;
        }
        catch (error) {
            console.error('❌ MongoDB connection error:', error);
            throw error;
        }
    }
    setupEventListeners() {
        mongoose_1.default.connection.on('connected', () => {
            console.log('📊 Mongoose connected to MongoDB');
            this.isConnected = true;
        });
        mongoose_1.default.connection.on('error', (error) => {
            console.error('❌ Mongoose connection error:', error);
            this.isConnected = false;
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('📊 Mongoose disconnected from MongoDB');
            this.isConnected = false;
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await this.disconnect();
                console.log('📊 MongoDB connection closed through app termination');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Error closing MongoDB connection:', error);
                process.exit(1);
            }
        });
    }
    async disconnect() {
        if (this.isConnected) {
            await mongoose_1.default.connection.close();
            this.isConnected = false;
        }
    }
    getConnection() {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return mongoose_1.default.connection;
    }
    isReady() {
        return this.isConnected && mongoose_1.default.connection.readyState === 1;
    }
}
// Export singleton instance
exports.dbManager = DatabaseManager.getInstance();
// Helper functions
async function connectToDatabase(uri) {
    const mongoUri = uri || process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not defined');
    }
    return exports.dbManager.connect({ uri: mongoUri });
}
function getDbConnection() {
    return exports.dbManager.getConnection();
}
async function disconnectFromDatabase() {
    return exports.dbManager.disconnect();
}
function isDatabaseReady() {
    return exports.dbManager.isReady();
}
