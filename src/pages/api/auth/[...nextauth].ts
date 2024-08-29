import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { env } from "../../../lib/env";
import { refreshAccessToken } from "@/lib/backend/auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: env.OFD_AZURE_AD_CLIENT_ID,
      clientSecret: env.OFD_AZURE_AD_CLIENT_SECRET,
      tenantId: env.OFD_AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: `openid profile email offline_access api://${env.OFD_AZURE_AD_CLIENT_ID}/email`,
        },
      },
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at;
      }
      try {
        const refreshedToken = await refreshAccessToken(token);
        return {
          ...token,
          ...refreshedToken,
        };
      } catch (error) {
        return {};
      }
    },

    async session({ session, token }) {
      if (Object.keys(token).length === 0) {
        return null;
      }
      session.user.id = token.sub;
      return session;
    },
  },
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);
