// packages/database/models/index.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// =============================================================================
// BASE INTERFACES
// =============================================================================

interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

interface TenantDocument extends BaseDocument {
  tenantId: mongoose.Types.ObjectId;
}

// =============================================================================
// TENANT MODEL
// =============================================================================

interface ITenant extends BaseDocument {
  name: string;
  subdomain: string;
  domain?: string;
  settings: {
    branding: {
      primaryColor: string;
      logo?: string;
      favicon?: string;
    };
    contact: {
      phone?: string;
      email?: string;
      address?: string;
    };
    business: {
      cuisine: string;
      description?: string;
      hours: Map<string, { open: string; close: string; closed: boolean }>;
    };
  };
  subscription: {
    status: 'active' | 'inactive' | 'suspended';
    plan: 'basic' | 'premium';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    expiresAt?: Date;
  };
}

const tenantSchema = new Schema<ITenant>({
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

// =============================================================================
// USER MODEL
// =============================================================================

interface IUser extends BaseDocument {
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'END_USER';
  tenantId?: mongoose.Types.ObjectId;
  profile: {
    phone?: string;
    avatar?: string;
  };
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
}

const userSchema = new Schema<IUser>({
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
    type: Schema.Types.ObjectId, 
    ref: 'Tenant',
    required: function(this: IUser) { 
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

// =============================================================================
// CATEGORY MODEL
// =============================================================================

interface ICategory extends TenantDocument {
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  image: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  tenantId: {
    type: Schema.Types.ObjectId,
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
// PRODUCT MODEL
// =============================================================================

interface IProduct extends TenantDocument {
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  inventory: {
    trackStock: boolean;
    stockQuantity: number;
    lowStockAlert: number;
  };
  availability: {
    isAvailable: boolean;
    availableDays: string[];
    availableHours: {
      start: string;
      end: string;
    };
  };
  options: Array<{
    name: string;
    type: 'single' | 'multiple';
    required: boolean;
    choices: Array<{
      name: string;
      price: number;
    }>;
  }>;
  nutritional: {
    calories?: number;
    allergens: string[];
    dietary: string[];
  };
  seo: {
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  sortOrder: number;
  isActive: boolean;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  
  category: { 
    type: Schema.Types.ObjectId, 
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
    type: Schema.Types.ObjectId,
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
const updateTimestamp = function(this: any, next: any) {
  this.updatedAt = new Date();
  next();
};

tenantSchema.pre('save', updateTimestamp);
userSchema.pre('save', updateTimestamp);
categorySchema.pre('save', updateTimestamp);
productSchema.pre('save', updateTimestamp);

// Generate slug for products
productSchema.pre('save', function(this: IProduct, next) {
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
tenantSchema.statics.findBySubdomain = function(subdomain: string) {
  return this.findOne({ subdomain: subdomain.toLowerCase() });
};

// User static methods
userSchema.statics.findByTenant = function(tenantId: string) {
  return this.find({ tenantId, isActive: true });
};

// Product virtuals
productSchema.virtual('isInStock').get(function(this: IProduct) {
  if (!this.inventory.trackStock) return true;
  return this.inventory.stockQuantity > 0;
});

// =============================================================================
// MODELS EXPORT
// =============================================================================

export const Tenant = (mongoose.models.Tenant as Model<ITenant>) || mongoose.model<ITenant>('Tenant', tenantSchema);
export const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
export const Category = (mongoose.models.Category as Model<ICategory>) || mongoose.model<ICategory>('Category', categorySchema);
export const Product = (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>('Product', productSchema);

// Export interfaces
export type { ITenant, IUser, ICategory, IProduct, BaseDocument, TenantDocument };