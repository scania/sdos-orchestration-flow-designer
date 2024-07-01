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
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);
