import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { env } from "../../../lib/env";

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: env.OFD_AZURE_AD_CLIENT_ID,
      clientSecret: env.OFD_AZURE_AD_CLIENT_SECRET,
      tenantId: env.OFD_AZURE_AD_TENANT_ID,
    }),
  ],
  //this needs to be in .env for production, used to encrypt tokens
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "auth/login",
    signOut: "auth/logout",
  },
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);
