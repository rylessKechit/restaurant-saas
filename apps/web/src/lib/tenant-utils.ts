// apps/web/src/lib/tenant-utils.ts
import { headers } from 'next/headers';

export interface TenantInfo {
  tenantId: string;
  subdomain: string;
  isMainDomain: boolean;
}

// Hook pour obtenir les infos tenant côté serveur uniquement
export async function getTenantFromHeaders(): Promise<TenantInfo> {
  const headersList = await headers();
  return {
    tenantId: headersList.get('x-tenant-id') || '',
    subdomain: headersList.get('x-subdomain') || '',
    isMainDomain: headersList.get('x-is-main-domain') === 'true',
  };
}

// Alternative pour les composants client : detection via window.location
export function getTenantFromUrl(): TenantInfo {
  if (typeof window === 'undefined') {
    return {
      tenantId: '',
      subdomain: '',
      isMainDomain: true,
    };
  }

  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const subdomain = parts[0];
    
    // Main app (localhost, www, admin)
    if (subdomain === 'localhost' || subdomain === 'www' || subdomain === 'admin') {
      return {
        tenantId: '',
        subdomain: '',
        isMainDomain: true,
      };
    }
    
    // Tenant subdomain (restaurant.localhost:3000)
    return {
      tenantId: subdomain,
      subdomain: subdomain,
      isMainDomain: false,
    };
  }
  
  // Production domain handling
  if (parts.length >= 3) {
    const subdomain = parts[0];
    
    // Main domains
    if (subdomain === 'www' || subdomain === 'admin' || subdomain === 'app') {
      return {
        tenantId: '',
        subdomain: '',
        isMainDomain: true,
      };
    }
    
    // Tenant subdomain
    return {
      tenantId: subdomain,
      subdomain: subdomain,
      isMainDomain: false,
    };
  }
  
  // Default to main domain
  return {
    tenantId: '',
    subdomain: '',
    isMainDomain: true,
  };
}