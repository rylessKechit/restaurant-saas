// apps/web/src/contexts/TenantContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Tenant {
  id: string;
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
      hours: Record<string, { open: string; close: string; closed: boolean }>;
    };
  };
  subscription: {
    status: 'active' | 'inactive' | 'suspended';
    plan: 'basic' | 'premium';
    expiresAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  isMainDomain: boolean;
  subdomain: string;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: React.ReactNode;
  initialTenantId?: string;
  initialSubdomain?: string;
  initialIsMainDomain?: boolean;
}

export function TenantProvider({ 
  children, 
  initialTenantId = '',
  initialSubdomain = '',
  initialIsMainDomain = true 
}: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subdomain] = useState(initialSubdomain);
  const [isMainDomain] = useState(initialIsMainDomain);

  const fetchTenant = async () => {
    if (!initialTenantId || isMainDomain) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/tenants/${initialTenantId}`);
      if (response.ok) {
        const tenantData = await response.json();
        setTenant(tenantData);
      } else {
        console.error('Tenant not found');
        setTenant(null);
      }
    } catch (error) {
      console.error('Error fetching tenant:', error);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTenant = async () => {
    setIsLoading(true);
    await fetchTenant();
  };

  useEffect(() => {
    fetchTenant();
  }, [initialTenantId, isMainDomain]);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        isLoading,
        isMainDomain,
        subdomain,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}