/* @next-codemod-ignore */

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

// The above comment tells Next.js to ignore warnings about synchronous dynamic API usage.

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
    error: "/error",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      } else {
        const db_user = await prisma.user.findFirst({
          where: {
            email: token?.email,
          },
        });
        if (db_user) {
          token.id = db_user.id;
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      // Handle callback after sign in
      if (url.includes('/api/auth/callback/google')) {
        return `${baseUrl}/dashboard`;
      }
      // Keep user on the same URL if it's within our domain
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Handle relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Default fallback
      return baseUrl;
    }
  },
  events: {
    signIn: async ({ user, account, profile }) => {
      if (account?.provider === 'google') {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            name: profile?.name,
            image: profile?.image,
          },
        }).catch(console.error);
      }
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        }
      },
    }),
  ],
};

export async function getAuthSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Error in getAuthSession:", error);
    return null;
  }
}