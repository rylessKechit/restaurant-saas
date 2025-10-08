// packages/database/models/index.ts
import mongoose from 'mongoose';

// Base schema with tenant isolation
const baseSchema = {
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: function(this: any) { 
      // tenantId not required for Tenant and User models
      return !['Tenant', 'User'].includes(this.constructor.modelName);
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Tenant Model
const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  domain: { type: String },
  
  settings: {
    branding: {
      primaryColor: { type: String, default: '#3B82F6' },
      logo: { type: String },
      favicon: { type: String }
    },
    contact: {
      phone: { type: String },
      email: { type: String },
      address: { type: String }
    },
    business: {
      cuisine: { type: String, required: true },
      description: { type: String },
      hours: { type: Map, of: mongoose.Schema.Types.Mixed }
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
  },
  
  ...baseSchema
});

// User Model with RBAC
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF', 'END_USER'], 
    default: 'END_USER' 
  },
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant',
    required: function(this: any) { 
      return this.role !== 'SUPER_ADMIN'; 
    }
  },
  
  profile: {
    phone: { type: String },
    avatar: { type: String }
  },
  
  permissions: [{ type: String }], // Additional granular permissions
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
  
  ...baseSchema
});

// Category Model
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  
  ...baseSchema
});

// Product Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  images: [{ type: String }],
  
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  
  inventory: {
    trackStock: { type: Boolean, default: false },
    stockQuantity: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 5 }
  },
  
  availability: {
    isAvailable: { type: Boolean, default: true },
    availableDays: [{ type: String }], // ['monday', 'tuesday', ...]
    availableHours: {
      start: { type: String }, // "09:00"
      end: { type: String }    // "22:00"
    }
  },
  
  options: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['single', 'multiple'], default: 'single' },
    required: { type: Boolean, default: false },
    choices: [{
      name: { type: String, required: true },
      price: { type: Number, default: 0 }
    }]
  }],
  
  nutritional: {
    calories: { type: Number },
    allergens: [{ type: String }],
    dietary: [{ type: String }] // ['vegetarian', 'vegan', 'gluten-free', ...]
  },
  
  seo: {
    slug: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String }
  },
  
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  
  ...baseSchema
});

// Customer Model
const customerSchema = new mongoose.Schema({
  email: { type: String },
  phone: { type: String },
  name: { type: String, required: true },
  
  addresses: [{
    type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, default: 'UAE' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    instructions: { type: String }
  }],
  
  preferences: {
    newsletter: { type: Boolean, default: false },
    sms: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true }
  },
  
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderAt: { type: Date }
  },
  
  ...baseSchema
});

// Order Model
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    selectedOptions: [{
      optionName: { type: String },
      choiceName: { type: String },
      price: { type: Number }
    }],
    subtotal: { type: Number, required: true }
  }],
  
  type: { type: String, enum: ['pickup', 'delivery'], required: true },
  
  delivery: {
    address: {
      street: { type: String },
      city: { type: String },
      postalCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      },
      instructions: { type: String }
    },
    fee: { type: Number, default: 0 },
    estimatedTime: { type: Number } // minutes
  },
  
  pickup: {
    scheduledTime: { type: Date },
    estimatedTime: { type: Number } // minutes
  },
  
  payment: {
    method: { type: String, enum: ['card', 'cash', 'wallet'], required: true },
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'refunded'], 
      default: 'pending' 
    },
    stripePaymentIntentId: { type: String },
    amount: { type: Number, required: true }
  },
  
  pricing: {
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  timeline: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String }
  }],
  
  notes: { type: String },
  
  ...baseSchema
});

// Indexes for performance
tenantSchema.index({ subdomain: 1 });
userSchema.index({ email: 1 });
userSchema.index({ tenantId: 1, role: 1 });
categorySchema.index({ tenantId: 1, sortOrder: 1 });
productSchema.index({ tenantId: 1, category: 1, isActive: 1 });
customerSchema.index({ tenantId: 1, email: 1 });
customerSchema.index({ tenantId: 1, phone: 1 });
orderSchema.index({ tenantId: 1, orderNumber: 1 });
orderSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

// Models
export const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);