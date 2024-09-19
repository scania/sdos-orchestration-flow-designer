import { env } from "../env";
import logger from "../logger";

const isTokenValid = (expires_at: number): boolean => {
  const isValid = Date.now() / 1000 < expires_at;
  logger.info(
    `Token expiration check: ${
      isValid ? "Valid" : "Expired"
    } (Expires at: ${new Date(expires_at * 1000).toISOString()})`
  );
  return isValid;
};

export async function refreshAccessToken(oldToken: any) {
  const token = { ...oldToken };
  try {
    logger.info(`Refreshing access token for user: ${token.sub}`);

    //adding buffer time
    if (!isTokenValid(token.accessTokenExpires - 500)) {
      const url = `https://login.microsoftonline.com/${env.OFD_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;
      const params = new URLSearchParams({
        client_id: env.OFD_AZURE_AD_CLIENT_ID,
        client_secret: env.OFD_AZURE_AD_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
        scope: `openid profile email offline_access api://${env.OFD_AZURE_AD_CLIENT_ID}/email`,
      });

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: params,
      });

      const refreshedTokens = await response.json();
      if (!response.ok) {
        logger.error("Failed to refresh access token:");
        throw refreshedTokens;
      }

      token.accessToken = refreshedTokens.access_token;
      token.accessTokenExpires =
        Math.floor(Date.now() / 1000) + refreshedTokens.expires_in;
      token.refreshToken = refreshedTokens.refresh_token ?? token.refreshToken;

      logger.info("Access token successfully refreshed.");
    } else {
      logger.info("Access token is still valid, no need to refresh.");
    }

    return token;
  } catch (error) {
    logger.error("Failed to refresh access token", error);
    throw error;
  }
}
