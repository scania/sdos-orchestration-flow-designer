import axios from "axios";
import { JWT } from "next-auth/jwt";
import { env } from "../env";
import logger from "../logger";
import { cacheGet, cacheSet } from "../backend/cache";

interface OBOTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function getOBOToken(token: JWT): Promise<OBOTokenResponse> {
  const tokenEndpoint = `https://login.microsoftonline.com/${env.OFD_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;
  const cacheKey = `obo_token_${token.sub}`;

  const fetchNewOBOToken = async (): Promise<OBOTokenResponse> => {
    try {
      logger.info(`Fetching new OBO token for user ${token.sub} from Azure AD`);
      const response = await axios.post<OBOTokenResponse>(
        tokenEndpoint,
        new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          client_id: env.OFD_AZURE_AD_CLIENT_ID!,
          client_secret: env.OFD_AZURE_AD_CLIENT_SECRET!,
          assertion: token.accessToken as string,
          requested_token_use: "on_behalf_of",
          scope: `api://${env.STARDOG_CLIENT_ID}/user_impersonation`,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const oboToken = response.data;
      logger.info(
        `Successfully fetched new OBO token for user ${token.sub} with expiration in ${oboToken.expires_in} seconds`
      );

      return oboToken;
    } catch (error) {
      logger.error(`Failed to obtain OBO token for user ${token.sub}`, error);
      throw new Error("Failed to obtain OBO token");
    }
  };
  let oboToken: OBOTokenResponse | undefined;
  const timeBuffer = 60;
  oboToken = cacheGet(cacheKey);
  if (!oboToken) {
    oboToken = await fetchNewOBOToken();
    cacheSet(cacheKey, oboToken, oboToken.expires_in - timeBuffer);
  }

  logger.info(`Returning OBO token for user ${token.sub}`);
  return oboToken;
}
