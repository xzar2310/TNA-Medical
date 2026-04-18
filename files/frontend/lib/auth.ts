import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const authConfig: NextAuthConfig = {
  providers: [
    // ── Email / Password ──────────────────────────────────────────────────────
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) throw new Error('API returned non-OK');

          const data = await res.json();
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.full_name,
            role: data.user.role,
            accessToken: data.access_token,
          };
        } catch {
          // ── Dev fallback — remove when backend is live ──────────────
          // Demo accounts for local development without backend API
          const devAccounts = [
            { email: 'admin@tna.com', password: 'Admin@1234', id: 'dev-admin-1', name: 'TNA Admin', role: 'admin' },
            { email: 'user@tna.com',  password: 'User@1234',  id: 'dev-user-1',  name: 'TNA Customer', role: 'customer' },
          ];
          const match = devAccounts.find(
            (a) => a.email === credentials.email && a.password === credentials.password
          );
          if (match) {
            return { id: match.id, email: match.email, name: match.name, role: match.role, accessToken: 'dev-token' };
          }
          return null;
        }
      },
    }),

    // ── Google OAuth ──────────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, persist custom fields into the JWT
      if (user) {
        token.id = user.id as string;
        token.role = (user.role as string) ?? 'customer';
        token.accessToken = user.accessToken as string;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose safe fields to the client session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: { strategy: 'jwt' },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
