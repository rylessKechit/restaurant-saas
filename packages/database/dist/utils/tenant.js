"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantHelpers = exports.TenantDB = void 0;
exports.createTenantDB = createTenantDB;
// packages/database/utils/tenant.ts
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Tenant-aware database operations utility (No Generics)
 */
class TenantDB {
    constructor(tenantId) {
        this.tenantId = typeof tenantId === 'string'
            ? new mongoose_1.default.Types.ObjectId(tenantId)
            : tenantId;
    }
    /**
     * Add tenant filter to query
     */
    addTenantFilter(filter = {}) {
        return {
            ...filter,
            tenantId: this.tenantId
        };
    }
    /**
     * Find documents with tenant isolation
     */
    async find(model, filter = {}, options) {
        return model.find(this.addTenantFilter(filter), null, options);
    }
    /**
     * Find one document with tenant isolation
     */
    async findOne(model, filter = {}, options) {
        return model.findOne(this.addTenantFilter(filter), null, options);
    }
    /**
     * Find by ID with tenant isolation
     */
    async findById(model, id, options) {
        return model.findOne(this.addTenantFilter({ _id: id }), null, options);
    }
    /**
     * Create document with tenant ID
     */
    async create(model, data) {
        const docWithTenant = {
            ...data,
            tenantId: this.tenantId
        };
        return model.create(docWithTenant);
    }
    /**
     * Update documents with tenant isolation
     */
    async updateMany(model, filter = {}, update, options) {
        return model.updateMany(this.addTenantFilter(filter), update, options);
    }
    /**
     * Update one document with tenant isolation
     */
    async updateOne(model, filter = {}, update, options) {
        return model.updateOne(this.addTenantFilter(filter), update, options);
    }
    /**
     * Update by ID with tenant isolation
     */
    async updateById(model, id, update, options) {
        return model.findOneAndUpdate(this.addTenantFilter({ _id: id }), update, { new: true, ...options });
    }
    /**
     * Delete documents with tenant isolation
     */
    async deleteMany(model, filter = {}) {
        return model.deleteMany(this.addTenantFilter(filter));
    }
    /**
     * Delete one document with tenant isolation
     */
    async deleteOne(model, filter = {}) {
        return model.deleteOne(this.addTenantFilter(filter));
    }
    /**
     * Delete by ID with tenant isolation
     */
    async deleteById(model, id) {
        return model.findOneAndDelete(this.addTenantFilter({ _id: id }));
    }
    /**
     * Count documents with tenant isolation
     */
    async count(model, filter = {}) {
        return model.countDocuments(this.addTenantFilter(filter));
    }
    /**
     * Aggregate with tenant isolation
     */
    async aggregate(model, pipeline = []) {
        const tenantMatchStage = { $match: { tenantId: this.tenantId } };
        return model.aggregate([tenantMatchStage, ...pipeline]);
    }
    /**
     * Get tenant ID
     */
    getTenantId() {
        return this.tenantId;
    }
}
exports.TenantDB = TenantDB;
/**
 * Factory function to create tenant-aware DB instance
 */
function createTenantDB(tenantId) {
    return new TenantDB(tenantId);
}
/**
 * Simple helper functions for basic tenant operations
 */
exports.TenantHelpers = {
    /**
     * Add tenantId to a filter object
     */
    addTenantFilter: (tenantId, filter = {}) => {
        const objectId = typeof tenantId === 'string'
            ? new mongoose_1.default.Types.ObjectId(tenantId)
            : tenantId;
        return {
            ...filter,
            tenantId: objectId
        };
    },
    /**
     * Add tenantId to document data
     */
    addTenantId: (tenantId, data) => {
        const objectId = typeof tenantId === 'string'
            ? new mongoose_1.default.Types.ObjectId(tenantId)
            : tenantId;
        return {
            ...data,
            tenantId: objectId
        };
    }
};
