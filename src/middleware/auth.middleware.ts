import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnAuthorized } from "../errors";
import { ROLES } from "../types/review.types";

interface TokenPayload {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  avatar?: string;
  isVerified?: boolean;
  iat?: number;
  exp?: number;
}

export function validateUserRoleAndToken(requiredRoles: ROLES[] = []) {
  return async function (req: Request, res: Response, next: NextFunction) {
    // Get the token from the authorization header
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnAuthorized("Authorization header is missing");
    }

    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1];

    try {
      // Verify the token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "jwt_secret"
      ) as TokenPayload;

      // Attach the user data to the request
      req.user = {
        id: decoded.id,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role,
        avatar: decoded.avatar,
        isVerified: decoded.isVerified,
      };

      // If no specific roles are required, proceed
      if (requiredRoles.length === 0) {
        return next();
      }

      // Check if the user has one of the required roles
      if (!decoded.role || !requiredRoles.includes(decoded.role as ROLES)) {
        throw new UnAuthorized(
          "You are not authorized to access this resource"
        );
      }

      next();
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnAuthorized("Invalid token");
      }
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnAuthorized("Token expired");
      }
      throw err;
    }
  };
}
