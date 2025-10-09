// packages/database/index.ts

// Connection utilities
export {
  dbManager,
  connectToDatabase,
  getDbConnection,
  disconnectFromDatabase,
  isDatabaseReady
} from './utils/connection';

// Models
export {
  Tenant,
  User,
  Category,
  Product
} from './models/index';

// Types
export type {
  ITenant,
  IUser,
  ICategory,
  IProduct,
  BaseDocument,
  TenantDocument
} from './models/index';

// Tenant utilities (simplified)
export {
  TenantDB,
  createTenantDB,
  TenantHelpers
} from './utils/tenant';

export type {
  TenantAwareDocument
} from './utils/tenant';