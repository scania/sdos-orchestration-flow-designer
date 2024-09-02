import { env } from "../env";
import { getOBOToken as getStardogOBOToken } from "./stardogOBO";
import { getOBOToken as getSdosOBOToken } from "./sdosOBO";
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

    if (!isTokenValid(token.accessTokenExpires)) {
      const url = `https://login.microsoftonline.com/${env.OFD_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;
      const params = new URLSearchParams({
        client_id: env.OFD_AZURE_AD_CLIENT_ID,
        client_secret: env.OFD_AZURE_AD_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
        scope: "https://graph.microsoft.com/.default",
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

    // Handle Stardog OBO token
    if (!token.stardogOBO || !isTokenValid(token.stardogOBO.expires_in)) {
      logger.info("Fetching new Stardog OBO token...");
      const stardogOBOResponse = await getStardogOBOToken({
        accessToken: token.accessToken,
      });
      token.stardogOBO = {
        token: stardogOBOResponse.access_token,
        expires_in:
          Math.floor(Date.now() / 1000) + stardogOBOResponse.expires_in,
      };
      logger.info("Stardog OBO token refreshed.");
    }

    // Handle SDOS OBO token
    if (!token.sdosOBO || !isTokenValid(token.sdosOBO.expires_in)) {
      logger.info("Fetching new SDOS OBO token...");
      const sdosOBOResponse = await getSdosOBOToken({
        accessToken: token.accessToken,
      });
      token.sdosOBO = {
        token: sdosOBOResponse.access_token,
        expires_in: Math.floor(Date.now() / 1000) + sdosOBOResponse.expires_in,
      };
      logger.info("SDOS OBO token refreshed.");
    }

    return token;
  } catch (error) {
    logger.error("Failed to refresh access or OBO tokens:", error);
    throw error;
  }
}
