import mongoose from 'mongoose';
interface ConnectionConfig {
    uri: string;
    options?: mongoose.ConnectOptions;
}
declare class DatabaseManager {
    private static instance;
    private connections;
    private isConnected;
    private constructor();
    static getInstance(): DatabaseManager;
    connect(config: ConnectionConfig): Promise<mongoose.Connection>;
    private setupEventListeners;
    disconnect(): Promise<void>;
    getConnection(): mongoose.Connection;
    isReady(): boolean;
}
export declare const dbManager: DatabaseManager;
export declare function connectToDatabase(uri?: string): Promise<mongoose.Connection>;
export declare function getDbConnection(): mongoose.Connection;
export declare function disconnectFromDatabase(): Promise<void>;
export declare function isDatabaseReady(): boolean;
export {};
