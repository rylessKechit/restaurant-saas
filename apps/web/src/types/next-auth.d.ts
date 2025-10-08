import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'END_USER';
      tenantId?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'END_USER';
    tenantId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'END_USER';
    tenantId?: string;
  }
}