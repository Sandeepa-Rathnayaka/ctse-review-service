import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          error.errors.map((err) => {
            if (err.code === "custom") {
              return { ["custom"]: err.message };
            } else {
              return { [err.path[1]]: err.message };
            }
          })
        );
      }
      next(error);
    }
  };

export default validate;
