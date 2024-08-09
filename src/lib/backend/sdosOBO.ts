import axios from "axios";
import { JWT } from "next-auth/jwt";
import { env } from "../env";

interface OBOTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function getOBOToken(token: JWT): Promise<string> {
  const tokenEndpoint = `https://login.microsoftonline.com/${env.OFD_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;

  try {
    const response = await axios.post<OBOTokenResponse>(
      tokenEndpoint,
      new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        client_id: env.OFD_AZURE_AD_CLIENT_ID!,
        client_secret: env.OFD_AZURE_AD_CLIENT_SECRET!,
        assertion: token.accessToken as string,
        requested_token_use: "on_behalf_of",
        scope: "api://ce742e40-7d46-49cc-84d4-a89fdbe12ec6/user_impersonation",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching OBO token:", error);
    throw new Error("Failed to obtain OBO token");
  }
}
