import { CookieOptions, Response } from "express";
import { fiftenMinutesFromNow, thirtyDaysFromNow } from "./date";
import { NODE_ENV } from "../constants/env";

const defaults: CookieOptions = {
  sameSite: "none",
  //sameSite: NODE_ENV === "production" ? "none" : "lax",
  httpOnly: true,
  //secure: NODE_ENV === "production",
  secure: true,
};

export const accessTokenCookieOptions = () => ({
  ...defaults,
  expires: fiftenMinutesFromNow(),
});

export const refreshTokenCookieOptions = () => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path: "/api/v1/auth/refresh", // Refresh tokens will be sent on this path
});

export const setAuthCookies = (
  accessToken: string,
  refreshToken: string,
  res: Response
) =>
  res
    .cookie("accessToken", accessToken, accessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions());

export const clearAuthCookies = (res: Response) =>
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: "/auth/refresh" });
