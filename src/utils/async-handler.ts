import { NextFunction, Request, Response } from "express";

type AsyncControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (
  controller: AsyncControllerFunction
): AsyncControllerFunction => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
