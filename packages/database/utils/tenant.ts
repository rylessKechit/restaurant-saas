// packages/database/utils/tenant.ts
import mongoose from 'mongoose';

/**
 * Tenant-aware database operations utility (No Generics)
 */
export class TenantDB {
  private tenantId: mongoose.Types.ObjectId;

  constructor(tenantId: string | mongoose.Types.ObjectId) {
    this.tenantId = typeof tenantId === 'string' 
      ? new mongoose.Types.ObjectId(tenantId) 
      : tenantId;
  }

  /**
   * Add tenant filter to query
   */
  private addTenantFilter(filter: any = {}): any {
    return {
      ...filter,
      tenantId: this.tenantId
    };
  }

  /**
   * Find documents with tenant isolation
   */
  async find(model: any, filter: any = {}, options?: any): Promise<any[]> {
    return model.find(this.addTenantFilter(filter), null, options);
  }

  /**
   * Find one document with tenant isolation
   */
  async findOne(model: any, filter: any = {}, options?: any): Promise<any | null> {
    return model.findOne(this.addTenantFilter(filter), null, options);
  }

  /**
   * Find by ID with tenant isolation
   */
  async findById(model: any, id: string | mongoose.Types.ObjectId, options?: any): Promise<any | null> {
    return model.findOne(this.addTenantFilter({ _id: id }), null, options);
  }

  /**
   * Create document with tenant ID
   */
  async create(model: any, data: any): Promise<any> {
    const docWithTenant = {
      ...data,
      tenantId: this.tenantId
    };
    return model.create(docWithTenant);
  }

  /**
   * Update documents with tenant isolation
   */
  async updateMany(model: any, filter: any = {}, update: any, options?: any): Promise<any> {
    return model.updateMany(this.addTenantFilter(filter), update, options);
  }

  /**
   * Update one document with tenant isolation
   */
  async updateOne(model: any, filter: any = {}, update: any, options?: any): Promise<any> {
    return model.updateOne(this.addTenantFilter(filter), update, options);
  }

  /**
   * Update by ID with tenant isolation
   */
  async updateById(model: any, id: string | mongoose.Types.ObjectId, update: any, options?: any): Promise<any | null> {
    return model.findOneAndUpdate(
      this.addTenantFilter({ _id: id }),
      update,
      { new: true, ...options }
    );
  }

  /**
   * Delete documents with tenant isolation
   */
  async deleteMany(model: any, filter: any = {}): Promise<any> {
    return model.deleteMany(this.addTenantFilter(filter));
  }

  /**
   * Delete one document with tenant isolation
   */
  async deleteOne(model: any, filter: any = {}): Promise<any> {
    return model.deleteOne(this.addTenantFilter(filter));
  }

  /**
   * Delete by ID with tenant isolation
   */
  async deleteById(model: any, id: string | mongoose.Types.ObjectId): Promise<any | null> {
    return model.findOneAndDelete(this.addTenantFilter({ _id: id }));
  }

  /**
   * Count documents with tenant isolation
   */
  async count(model: any, filter: any = {}): Promise<number> {
    return model.countDocuments(this.addTenantFilter(filter));
  }

  /**
   * Aggregate with tenant isolation
   */
  async aggregate(model: any, pipeline: any[] = []): Promise<any[]> {
    const tenantMatchStage = { $match: { tenantId: this.tenantId } };
    return model.aggregate([tenantMatchStage, ...pipeline]);
  }

  /**
   * Get tenant ID
   */
  getTenantId(): mongoose.Types.ObjectId {
    return this.tenantId;
  }
}

/**
 * Factory function to create tenant-aware DB instance
 */
export function createTenantDB(tenantId: string | mongoose.Types.ObjectId): TenantDB {
  return new TenantDB(tenantId);
}

/**
 * Simple helper functions for basic tenant operations
 */
export const TenantHelpers = {
  /**
   * Add tenantId to a filter object
   */
  addTenantFilter: (tenantId: string | mongoose.Types.ObjectId, filter: any = {}) => {
    const objectId = typeof tenantId === 'string' 
      ? new mongoose.Types.ObjectId(tenantId) 
      : tenantId;
    
    return {
      ...filter,
      tenantId: objectId
    };
  },

  /**
   * Add tenantId to document data
   */
  addTenantId: (tenantId: string | mongoose.Types.ObjectId, data: any) => {
    const objectId = typeof tenantId === 'string' 
      ? new mongoose.Types.ObjectId(tenantId) 
      : tenantId;
    
    return {
      ...data,
      tenantId: objectId
    };
  }
};

// Export type for backward compatibility
export interface TenantAwareDocument {
  tenantId?: mongoose.Types.ObjectId;
  [key: string]: any;
}