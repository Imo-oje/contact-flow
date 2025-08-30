import ErrorCode from "../constants/error";
import { UNAUTHORIZED } from "../constants/http";
import appAssert from "../utils/app-assert";
import { asyncHandler } from "../utils/async-handler";
import { verifyToken } from "../utils/jwt";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const accessToken = req.cookies.accessToken;
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Unauthorized",
    ErrorCode.InvalidAccessToken
  );
  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    ErrorCode.InvalidAccessToken
  );

  req.userId = payload.userId;
  req.sessionId = payload.sessionId;
  next();
});
