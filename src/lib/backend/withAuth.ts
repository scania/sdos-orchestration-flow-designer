import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { getToken, JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import logger from "@/lib/logger";
import { env } from "@/lib/env";

export type OboGetter = (jwt: JWT) => Promise<{ access_token?: string }>;

export interface AuthContext {
  session: Session | null;
  jwt: JWT;
  tokens: Record<string, string>; // serviceName → access_token
}

export function withAuth(tokenGetters: Record<string, OboGetter>) {
  return function wrap<R = any>(
    handler: (
      req: NextApiRequest,
      res: NextApiResponse<R>,
      ctx: AuthContext
    ) => unknown | Promise<unknown>
  ): NextApiHandler<R> {
    return async (req, res) => {
      try {
        logger.debug("Request details", { method: req.method, url: req.url });

        const session = await getServerSession(req, res, authOptions);
        if (!session && env.NODE_ENV === "production") {
          return res.status(401).json({ error: "Unauthorized" } as any);
        }

        const jwt = await getToken({ req, secret: env.NEXTAUTH_SECRET });
        if (!jwt) return res.status(403).json({ error: "Forbidden" } as any);

        const tokenPairs = await Promise.all(
          Object.entries(tokenGetters).map(async ([name, getter]) => {
            const { access_token } = await getter(jwt);
            if (!access_token) throw new Error(`Missing OBO token for ${name}`);
            return [name, access_token] as const;
          })
        );

        const tokens = Object.fromEntries(tokenPairs) as Record<string, string>;

        return (await handler(req, res, { session, jwt, tokens })) as any;
      } catch (err: any) {
        logger.error("Unexpected error", err?.message);
        return res.status(500).json({ error: "Internal Server Error" } as any);
      }
    };
  };
}
