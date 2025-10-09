import mongoose, { Document } from 'mongoose';
interface BaseDocument extends Document {
    createdAt: Date;
    updatedAt: Date;
}
interface TenantDocument extends BaseDocument {
    tenantId: mongoose.Types.ObjectId;
}
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
            hours: Map<string, {
                open: string;
                close: string;
                closed: boolean;
            }>;
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
interface ICategory extends TenantDocument {
    name: string;
    description?: string;
    image?: string;
    sortOrder: number;
    isActive: boolean;
}
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
export declare const Tenant: mongoose.Model<ITenant, {}, {}, {}, mongoose.Document<unknown, {}, ITenant, {}, {}> & ITenant & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const Category: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export type { ITenant, IUser, ICategory, IProduct, BaseDocument, TenantDocument };
