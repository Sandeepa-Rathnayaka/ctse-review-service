import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors";
import logger from "../config/logger.config";

const ErrorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err.message}`);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: err.message,
    message: "Something went wrong, please try again later",
  });
};

export default ErrorHandlerMiddleware;
