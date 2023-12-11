import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider, {
  CredentialsConfig,
} from "next-auth/providers/credentials";
import { env } from "../../../lib/env";

const providers: CredentialsConfig<{
  username: { label: string; type: string; placeholder: string };
  password: { label: string; type: string };
}>[] = [];

// Only push the CredentialsProvider if in development environment
if (process.env.NODE_ENV === "development") {
  providers.push(
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const user = {
          id: "1",
          name: "J Smith",
          email: "jsmith@example.com",
        };

        if (user) {
          return user;
        } else {
          return null;
        }
      },
    })
  );
}
export const authOptions = {
  providers: [
    ...providers,
    AzureADProvider({
      clientId: env.OFD_AZURE_AD_CLIENT_ID,
      clientSecret: env.OFD_AZURE_AD_CLIENT_SECRET,
      tenantId: env.OFD_AZURE_AD_TENANT_ID,
    }),
  ],
  //this needs to be in .env for production
  secret: "YOUR_SECRET_HERE",
  pages: {
    signIn: "auth/login",
    signOut: "auth/logout",
  },
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);
