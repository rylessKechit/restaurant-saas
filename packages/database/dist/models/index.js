"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = exports.Category = exports.User = exports.Tenant = void 0;
// packages/database/models/index.ts
const mongoose_1 = __importStar(require("mongoose"));
const tenantSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    subdomain: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[a-z0-9-]+$/
    },
    domain: { type: String, trim: true },
    settings: {
        branding: {
            primaryColor: { type: String, default: '#3B82F6' },
            logo: { type: String },
            favicon: { type: String }
        },
        contact: {
            phone: { type: String, trim: true },
            email: { type: String, lowercase: true, trim: true },
            address: { type: String, trim: true }
        },
        business: {
            cuisine: { type: String, required: true, trim: true },
            description: { type: String, trim: true },
            hours: {
                type: Map,
                of: {
                    open: { type: String, required: true },
                    close: { type: String, required: true },
                    closed: { type: Boolean, default: false }
                },
                default: new Map()
            }
        }
    },
    subscription: {
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active'
        },
        plan: {
            type: String,
            enum: ['basic', 'premium'],
            default: 'basic'
        },
        stripeCustomerId: { type: String },
        stripeSubscriptionId: { type: String },
        expiresAt: { type: Date }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: { type: String, trim: true },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF', 'END_USER'],
        default: 'END_USER'
    },
    tenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: function () {
            return this.role !== 'SUPER_ADMIN';
        },
        index: true
    },
    profile: {
        phone: { type: String, trim: true },
        avatar: { type: String }
    },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    inventory: {
        trackStock: { type: Boolean, default: false },
        stockQuantity: { type: Number, default: 0, min: 0 },
        lowStockAlert: { type: Number, default: 5, min: 0 }
    },
    availability: {
        isAvailable: { type: Boolean, default: true },
        availableDays: [{
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            }],
        availableHours: {
            start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
            end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
        }
    },
    options: [{
            name: { type: String, required: true, trim: true },
            type: { type: String, enum: ['single', 'multiple'], default: 'single' },
            required: { type: Boolean, default: false },
            choices: [{
                    name: { type: String, required: true, trim: true },
                    price: { type: Number, default: 0, min: 0 }
                }]
        }],
    nutritional: {
        calories: { type: Number, min: 0 },
        allergens: [{ type: String, trim: true }],
        dietary: [{
                type: String,
                enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher'],
                trim: true
            }]
    },
    seo: {
        slug: { type: String, trim: true, lowercase: true },
        metaTitle: { type: String, trim: true },
        metaDescription: { type: String, trim: true }
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// =============================================================================
// INDEXES FOR PERFORMANCE
// =============================================================================
// Tenant indexes
tenantSchema.index({ subdomain: 1 });
tenantSchema.index({ 'subscription.status': 1 });
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ tenantId: 1, isActive: 1 });
// Category indexes
categorySchema.index({ tenantId: 1, sortOrder: 1 });
categorySchema.index({ tenantId: 1, isActive: 1 });
// Product indexes
productSchema.index({ tenantId: 1, category: 1, isActive: 1 });
productSchema.index({ tenantId: 1, 'availability.isAvailable': 1 });
productSchema.index({ tenantId: 1, sortOrder: 1 });
// =============================================================================
// PRE-SAVE MIDDLEWARE
// =============================================================================
// Update timestamps
const updateTimestamp = function (next) {
    this.updatedAt = new Date();
    next();
};
tenantSchema.pre('save', updateTimestamp);
userSchema.pre('save', updateTimestamp);
categorySchema.pre('save', updateTimestamp);
productSchema.pre('save', updateTimestamp);
// Generate slug for products
productSchema.pre('save', function (next) {
    if (this.isModified('name') && !this.seo.slug) {
        this.seo.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});
// =============================================================================
// STATIC METHODS & VIRTUALS
// =============================================================================
// Tenant static methods
tenantSchema.statics.findBySubdomain = function (subdomain) {
    return this.findOne({ subdomain: subdomain.toLowerCase() });
};
// User static methods
userSchema.statics.findByTenant = function (tenantId) {
    return this.find({ tenantId, isActive: true });
};
// Product virtuals
productSchema.virtual('isInStock').get(function () {
    if (!this.inventory.trackStock)
        return true;
    return this.inventory.stockQuantity > 0;
});
// =============================================================================
// MODELS EXPORT
// =============================================================================
exports.Tenant = mongoose_1.default.models.Tenant || mongoose_1.default.model('Tenant', tenantSchema);
exports.User = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
exports.Category = mongoose_1.default.models.Category || mongoose_1.default.model('Category', categorySchema);
exports.Product = mongoose_1.default.models.Product || mongoose_1.default.model('Product', productSchema);
