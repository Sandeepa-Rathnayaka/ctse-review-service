import { Express } from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        firstName?: string;
        lastName?: string;
        role?: string;
        avatar?: string;
        isVerified?: boolean;
      };
    }
  }
}
