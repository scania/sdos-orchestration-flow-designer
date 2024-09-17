import axios from "axios";
import { JWT } from "next-auth/jwt";
import { env } from "../env";
import logger from "../logger";
import { cacheFetch, cacheSet } from "../backend/cache";

interface OBOTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function getSDOSOBOToken(token: JWT): Promise<OBOTokenResponse> {
  const tokenEndpoint = `https://login.microsoftonline.com/${env.OFD_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;
  const cacheKey = `sdos_obo_token_${token.sub}`;

  const fetchNewOBOToken = async (): Promise<OBOTokenResponse> => {
    try {
      logger.info(
        `Fetching new SDOS OBO token for user ${token.sub} from Azure AD`
      );
      const response = await axios.post<OBOTokenResponse>(
        tokenEndpoint,
        new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          client_id: env.OFD_AZURE_AD_CLIENT_ID!,
          client_secret: env.OFD_AZURE_AD_CLIENT_SECRET!,
          assertion: token.accessToken as string,
          requested_token_use: "on_behalf_of",
          scope: `api://${env.SDOS_CLIENT_ID}/user_impersonation`,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const oboToken = response.data;
      logger.info(
        `Successfully fetched new SDOS OBO token for user ${token.sub} with expiration in ${oboToken.expires_in} seconds`
      );

      return oboToken;
    } catch (error) {
      logger.error(
        `Failed to obtain SDOS OBO token for user ${token.sub}`,
        error
      );
      throw new Error("Failed to obtain SDOS OBO token");
    }
  };

  const oboToken = await cacheFetch<OBOTokenResponse>(
    cacheKey,
    fetchNewOBOToken,
    undefined // TTL is set based on token expiration
  );

  cacheSet(cacheKey, oboToken, oboToken.expires_in);

  logger.info(`Returning SDOS OBO token for user ${token.sub}`);
  return oboToken;
}
