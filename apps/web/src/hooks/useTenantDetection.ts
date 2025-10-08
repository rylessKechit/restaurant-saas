// apps/web/src/hooks/useTenantDetection.ts
'use client';

import { useEffect, useState } from 'react';
import { getTenantFromUrl } from '@/lib/tenant-utils';

export function useTenantDetection() {
  const [tenantInfo, setTenantInfo] = useState({
    tenantId: '',
    subdomain: '',
    isMainDomain: true,
  });

  useEffect(() => {
    // Detection côté client via URL
    const info = getTenantFromUrl();
    setTenantInfo(info);
  }, []);

  return tenantInfo;
}