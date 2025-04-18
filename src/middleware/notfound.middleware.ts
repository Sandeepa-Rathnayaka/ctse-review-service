import { Request, Response } from "express";

const NotFoundMiddleware = (req: Request, res: Response) => {
  return res.status(404).json({
    error: "Route does not exist",
  });
};

export default NotFoundMiddleware;
