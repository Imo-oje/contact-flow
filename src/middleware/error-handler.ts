import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-assert";
import { ZodError } from "zod";
import {
  INTERNAL_SERVER_ERROR,
  REQUEST_ENTITY_TOO_LARGE,
} from "../constants/http";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log("ERROR: ", error);

  if (error instanceof AppError) {
    console.log("APPERROR");
    const { statuscode, message, errorCode } = error;
    return res.status(statuscode).json({
      message,
      errorCode,
    });
  }

  if (
    error.name === "PayloadTooLargeError" ||
    error.type === "entity.too.large"
  ) {
    return res.status(REQUEST_ENTITY_TOO_LARGE).json({
      message: "Payload too large",
      limit: error.limit,
    });
  }

  if (error instanceof PrismaClientValidationError) {
    const { name } = error;
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Client validation failed", name });
  }

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      return res.status(404).json({ message: "Related resource not found" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Duplicate entry" });
    }
    if (error.code === "P2024") {
      return res.status(503).json({ message: "Service unavailable" });
    }
    // Add more codes as needed

    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  if (error instanceof PrismaClientUnknownRequestError) {
    console.error("Unknown Prisma error:", error);
    return res.status(500).json({ message: "Database error occurred" });
  }

  if (error instanceof ZodError) {
    const mapped = error.issues.map((issue) => ({
      message: issue.message,
      path: issue.path,
    }));
    return res.status(INTERNAL_SERVER_ERROR).json({
      message: mapped[0].message,
      path: mapped[0].path[0],
    });
  }

  return res
    .status(INTERNAL_SERVER_ERROR)
    .json({ message: "Internal Server Error" });
};
