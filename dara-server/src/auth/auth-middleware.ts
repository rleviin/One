import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth-store";

export type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string;
  };
};

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const payload = verifyToken(token) as {
      userId: string;
      email: string;
    };

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
