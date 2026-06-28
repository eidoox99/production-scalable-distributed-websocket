import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken, type AccessTokenPayload } from "@pkg/shared";

export type AuthedRequest = Request & {
  user: AccessTokenPayload;
};

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing or invalid authorization header" });
    return;
  }

  try {
    (req as AuthedRequest).user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: "invalid or expired token" });
  }
}
