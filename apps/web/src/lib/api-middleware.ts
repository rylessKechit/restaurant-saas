// apps/web/src/lib/api-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-utils';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name?: string;
    role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'END_USER';
    tenantId?: string;
  };
  tenant?: {
    tenantId: string;
    subdomain: string;
    isMainDomain: boolean;
  };
}

/**
 * Middleware d'authentification pour les API routes
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest) => {
    try {
      // Vérifier la session utilisateur
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Ajouter les infos utilisateur à la requête avec types corrects
      req.user = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || undefined,
        role: session.user.role,
        tenantId: session.user.tenantId
      };

      return handler(req);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware de vérification des rôles
 */
export function withRole(
  allowedRoles: Array<'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'END_USER'>
) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!req.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(req);
    });
  };
}

/**
 * Middleware d'isolation tenant
 */
export function withTenant(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      // Obtenir les infos tenant depuis les headers
      const tenantInfo = await getTenantFromHeaders();
      req.tenant = tenantInfo;

      // Vérifier que l'utilisateur appartient au bon tenant
      if (!tenantInfo.isMainDomain && req.user?.role !== 'SUPER_ADMIN') {
        if (req.user?.tenantId !== tenantInfo.tenantId) {
          return NextResponse.json(
            { error: 'Forbidden - Tenant mismatch' },
            { status: 403 }
          );
        }
      }

      return handler(req);
    } catch (error) {
      console.error('Tenant middleware error:', error);
      return NextResponse.json(
        { error: 'Tenant validation failed' },
        { status: 500 }
      );
    }
  });
}

/**
 * Middleware combiné : Auth + Role + Tenant
 */
export function withAuthAndTenant(
  allowedRoles: Array<'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'END_USER'>
) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withTenant(withRole(allowedRoles)(handler));
  };
}

/**
 * Version simplifiée sans auth pour tester
 */
export function simpleHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return handler;
}