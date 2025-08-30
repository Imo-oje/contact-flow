import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-assert";
import { ZodError } from "zod";
import {
  INTERNAL_SERVER_ERROR,
  REQUEST_ENTITY_TOO_LARGE,
} from "../constants/http";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log("ERROR: ", error);

  if (error instanceof AppError) {
    const { statuscode, message, errorCode } = error;
    res.status(statuscode).json({
      message,
      errorCode,
    });
  }

  if (
    error.name === "PayloadTooLargeError" ||
    error.type === "entity.too.large"
  ) {
    res.status(REQUEST_ENTITY_TOO_LARGE).json({
      message: "Payload too large",
      limit: error.limit,
    });
  }

  if (error instanceof PrismaClientValidationError) {
    const { name } = error;
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Client validation failed", name });
  }

  if (error instanceof ZodError) {
    res.status(INTERNAL_SERVER_ERROR).json({
      message: error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path,
      })),
    });
  }
};
