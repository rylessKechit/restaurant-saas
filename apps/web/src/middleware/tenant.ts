// apps/web/src/middleware/tenant.ts
import { NextRequest, NextResponse } from 'next/server';

export interface TenantInfo {
  tenantId: string;
  subdomain: string;
  isMainDomain: boolean;
}

export function detectTenant(request: NextRequest): TenantInfo {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Extract subdomain
  const parts = hostname.split('.');
  
  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const subdomain = parts[0];
    
    // Main app (www, admin, localhost)
    if (subdomain === 'localhost' || subdomain === 'www' || subdomain === 'admin') {
      return {
        tenantId: '',
        subdomain: '',
        isMainDomain: true
      };
    }
    
    // Tenant subdomain (restaurant.localhost:3000)
    return {
      tenantId: subdomain,
      subdomain: subdomain,
      isMainDomain: false
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
        isMainDomain: true
      };
    }
    
    // Tenant subdomain
    return {
      tenantId: subdomain,
      subdomain: subdomain,
      isMainDomain: false
    };
  }
  
  // Default to main domain
  return {
    tenantId: '',
    subdomain: '',
    isMainDomain: true
  };
}

// Middleware function
export function middleware(request: NextRequest) {
  const tenant = detectTenant(request);
  const url = request.nextUrl.clone();
  
  // Add tenant info to headers for pages to access
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenant.tenantId);
  response.headers.set('x-subdomain', tenant.subdomain);
  response.headers.set('x-is-main-domain', tenant.isMainDomain.toString());
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}