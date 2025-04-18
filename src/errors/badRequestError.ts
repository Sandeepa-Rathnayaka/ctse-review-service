import { StatusCodes } from "http-status-codes";
import CustomError from "./customError";

class BadRequestError extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export default BadRequestError;
