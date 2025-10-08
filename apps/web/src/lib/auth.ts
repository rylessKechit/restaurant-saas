import { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import EmailProvider from 'next-auth/providers/email';
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is not defined');
}

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_SERVER_PORT || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@restaurant-saas.com',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist additional user info in token
      if (user) {
        token.id = user.id;
        token.role = (user.role as 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'END_USER') || 'END_USER';
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'END_USER';
        session.user.tenantId = token.tenantId as string | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', { userId: user.id, email: user.email, isNewUser });
    },
    async signOut({ session, token }) {
      console.log('User signed out:', { userId: token?.id });
    },
  },
  debug: process.env.NODE_ENV === 'development',
};