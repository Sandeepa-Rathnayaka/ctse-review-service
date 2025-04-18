import { StatusCodes } from "http-status-codes";
import CustomError from "./customError";

class UnAuthorized extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
    Object.setPrototypeOf(this, UnAuthorized.prototype);
  }
}

export default UnAuthorized;
