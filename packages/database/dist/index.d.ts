export { dbManager, connectToDatabase, getDbConnection, disconnectFromDatabase, isDatabaseReady } from './utils/connection';
export { Tenant, User, Category, Product } from './models/index';
export type { ITenant, IUser, ICategory, IProduct, BaseDocument, TenantDocument } from './models/index';
export { TenantDB, createTenantDB, TenantHelpers } from './utils/tenant';
export type { TenantAwareDocument } from './utils/tenant';
