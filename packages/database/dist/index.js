"use strict";
// packages/database/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantHelpers = exports.createTenantDB = exports.TenantDB = exports.Product = exports.Category = exports.User = exports.Tenant = exports.isDatabaseReady = exports.disconnectFromDatabase = exports.getDbConnection = exports.connectToDatabase = exports.dbManager = void 0;
// Connection utilities
var connection_1 = require("./utils/connection");
Object.defineProperty(exports, "dbManager", { enumerable: true, get: function () { return connection_1.dbManager; } });
Object.defineProperty(exports, "connectToDatabase", { enumerable: true, get: function () { return connection_1.connectToDatabase; } });
Object.defineProperty(exports, "getDbConnection", { enumerable: true, get: function () { return connection_1.getDbConnection; } });
Object.defineProperty(exports, "disconnectFromDatabase", { enumerable: true, get: function () { return connection_1.disconnectFromDatabase; } });
Object.defineProperty(exports, "isDatabaseReady", { enumerable: true, get: function () { return connection_1.isDatabaseReady; } });
// Models
var index_1 = require("./models/index");
Object.defineProperty(exports, "Tenant", { enumerable: true, get: function () { return index_1.Tenant; } });
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return index_1.User; } });
Object.defineProperty(exports, "Category", { enumerable: true, get: function () { return index_1.Category; } });
Object.defineProperty(exports, "Product", { enumerable: true, get: function () { return index_1.Product; } });
// Tenant utilities (simplified)
var tenant_1 = require("./utils/tenant");
Object.defineProperty(exports, "TenantDB", { enumerable: true, get: function () { return tenant_1.TenantDB; } });
Object.defineProperty(exports, "createTenantDB", { enumerable: true, get: function () { return tenant_1.createTenantDB; } });
Object.defineProperty(exports, "TenantHelpers", { enumerable: true, get: function () { return tenant_1.TenantHelpers; } });
