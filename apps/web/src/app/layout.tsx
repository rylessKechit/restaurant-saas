// apps/web/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { TenantProvider } from '@/contexts/TenantContext';
import { getTenantFromHeaders } from '@/lib/tenant-utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Restaurant SaaS - Online Ordering Platform',
  description: 'Multi-tenant SaaS platform for restaurant online ordering with pickup and delivery',
  keywords: ['restaurant', 'online ordering', 'SaaS', 'delivery', 'pickup'],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get tenant info from headers (server-side)
  const tenantInfo = await getTenantFromHeaders();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <TenantProvider
            initialTenantId={tenantInfo.tenantId}
            initialSubdomain={tenantInfo.subdomain}
            initialIsMainDomain={tenantInfo.isMainDomain}
          >
            {children}
          </TenantProvider>
        </Providers>
      </body>
    </html>
  );
}