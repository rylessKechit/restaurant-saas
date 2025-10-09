import mongoose from 'mongoose';
/**
 * Tenant-aware database operations utility (No Generics)
 */
export declare class TenantDB {
    private tenantId;
    constructor(tenantId: string | mongoose.Types.ObjectId);
    /**
     * Add tenant filter to query
     */
    private addTenantFilter;
    /**
     * Find documents with tenant isolation
     */
    find(model: any, filter?: any, options?: any): Promise<any[]>;
    /**
     * Find one document with tenant isolation
     */
    findOne(model: any, filter?: any, options?: any): Promise<any | null>;
    /**
     * Find by ID with tenant isolation
     */
    findById(model: any, id: string | mongoose.Types.ObjectId, options?: any): Promise<any | null>;
    /**
     * Create document with tenant ID
     */
    create(model: any, data: any): Promise<any>;
    /**
     * Update documents with tenant isolation
     */
    updateMany(model: any, filter: any | undefined, update: any, options?: any): Promise<any>;
    /**
     * Update one document with tenant isolation
     */
    updateOne(model: any, filter: any | undefined, update: any, options?: any): Promise<any>;
    /**
     * Update by ID with tenant isolation
     */
    updateById(model: any, id: string | mongoose.Types.ObjectId, update: any, options?: any): Promise<any | null>;
    /**
     * Delete documents with tenant isolation
     */
    deleteMany(model: any, filter?: any): Promise<any>;
    /**
     * Delete one document with tenant isolation
     */
    deleteOne(model: any, filter?: any): Promise<any>;
    /**
     * Delete by ID with tenant isolation
     */
    deleteById(model: any, id: string | mongoose.Types.ObjectId): Promise<any | null>;
    /**
     * Count documents with tenant isolation
     */
    count(model: any, filter?: any): Promise<number>;
    /**
     * Aggregate with tenant isolation
     */
    aggregate(model: any, pipeline?: any[]): Promise<any[]>;
    /**
     * Get tenant ID
     */
    getTenantId(): mongoose.Types.ObjectId;
}
/**
 * Factory function to create tenant-aware DB instance
 */
export declare function createTenantDB(tenantId: string | mongoose.Types.ObjectId): TenantDB;
/**
 * Simple helper functions for basic tenant operations
 */
export declare const TenantHelpers: {
    /**
     * Add tenantId to a filter object
     */
    addTenantFilter: (tenantId: string | mongoose.Types.ObjectId, filter?: any) => any;
    /**
     * Add tenantId to document data
     */
    addTenantId: (tenantId: string | mongoose.Types.ObjectId, data: any) => any;
};
export interface TenantAwareDocument {
    tenantId?: mongoose.Types.ObjectId;
    [key: string]: any;
}
