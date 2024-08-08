import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import { env } from "../../../lib/env";

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: env.OFD_AZURE_AD_CLIENT_ID,
      clientSecret: env.OFD_AZURE_AD_CLIENT_SECRET,
      tenantId: env.OFD_AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope:
            "openid profile email offline_access api://3e86062d-4e9c-40b6-a3e6-cf24453e765e/email",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt", // Ensure JWT strategy is enabled
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);
