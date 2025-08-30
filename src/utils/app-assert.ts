import assert from "node:assert";
import { HttpStatusCode } from "../constants/http";
import ErrorCode from "../constants/error";

export class AppError extends Error {
  constructor(
    public statuscode: HttpStatusCode,
    public message: string,
    public errorCode?: ErrorCode
  ) {
    super(message);
  }
}

type AppAssert = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  errorCode?: ErrorCode
) => asserts condition;

const appAssert: AppAssert = (condition, httpStatusCode, message, errorCode) =>
  assert(condition, new AppError(httpStatusCode, message, errorCode));

export default appAssert;
