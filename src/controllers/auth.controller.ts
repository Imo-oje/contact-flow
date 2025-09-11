import { asyncHandler } from "../utils/async-handler";
import {
  emailSchema,
  loginSchema,
  passwordResetSchema,
  registerSchema,
  verificatioCodeSchema,
} from "../utils/schema";
import bcrypt from "bcrypt";
import { APP_ORIGIN, SITE_NAME } from "../constants/env";
import { sendMail } from "../utils/send-mail";
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from "../constants/templates";
import appAssert from "../utils/app-assert";
import {
  CONFLICT,
  CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constants/http";
import {
  fiveMinutesAgo,
  ONE_DAY_MS,
  tenMinutesFromNow,
  thirtyDaysFromNow,
} from "../utils/date";
import { refreshTokenSignOptions, signToken, verifyToken } from "../utils/jwt";
import {
  accessTokenCookieOptions,
  clearAuthCookies,
  refreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookie";
import prisma from "../prisma/client";

export const registerHandler = asyncHandler(async (req, res) => {
  const { email, password, name, userAgent, ipAddress } =
    registerSchema().parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    });

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  appAssert(!existingUser, CONFLICT, "User Already Exists");

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
    },
  });

  // Create token and send verification email
  const verificationToken = await prisma.verificationCode.create({
    data: {
      userId: user.id,
      expiresAt: tenMinutesFromNow(),
    },
  });

  const url = `${APP_ORIGIN}/verify?token=${verificationToken.id}`;
  const sendEmail = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url, user.name),
  });
  appAssert(sendEmail, INTERNAL_SERVER_ERROR, "Error sending Email");

  // Create session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  // Sign tokens
  const refreshToken = signToken(
    { sessionId: session.id },
    refreshTokenSignOptions
  );
  const accessToken = signToken({ userId: user.id, sessionId: session.id });

  // Set auth cookies
  return setAuthCookies(accessToken, refreshToken, res)
    .status(CREATED)
    .json({
      message: `Welcome to ${SITE_NAME}. Let's get started`,
    });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const { email, password, userAgent, ipAddress } = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
    ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
  });

  // Validate user credentials
  const user = await prisma.user.findFirst({
    where: { email },
  });
  appAssert(user, UNAUTHORIZED, "Please check your credentials and try again");
  const isValid = await bcrypt.compare(password, user.passwordHash);
  appAssert(
    isValid,
    UNAUTHORIZED,
    "Please check your credentials and try again"
  );

  // Create session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  // Sign tokens
  const refreshToken = signToken(
    { sessionId: session.id },
    refreshTokenSignOptions
  );
  const accessToken = signToken({ userId: user.id, sessionId: session.id });

  // Set auth cookies
  return setAuthCookies(accessToken, refreshToken, res).status(OK).json({
    message: "You've been logged in successfully",
  });
});

export const logOutHandler = asyncHandler(async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const { payload } = verifyToken(accessToken);

  if (payload) {
    await prisma.session.delete({ where: { id: payload.sessionId } });
  }

  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "Logout successful" });
});

export const refreshHandler = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  appAssert(refreshToken, UNAUTHORIZED, "Invalid refresh token");

  // Verify token
  const { payload } = verifyToken(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  });
  appAssert(
    session && session.expiresAt.getTime() > Date.now(),
    UNAUTHORIZED,
    "Session expired"
  );

  // Extend session if it will expire within the next 24hrs
  const sessionWillSoonExpire =
    session.expiresAt.getTime() - Date.now() <= ONE_DAY_MS; //will expire within the next 24hrs

  if (sessionWillSoonExpire) {
    await prisma.session.update({
      where: { id: session.id },
      data: {
        expiresAt: thirtyDaysFromNow(),
      },
    });
  }

  // Update refresh token span along with session span
  const newRefreshToken = sessionWillSoonExpire
    ? signToken({ sessionId: session.id }, refreshTokenSignOptions)
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session.id,
  });

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, accessTokenCookieOptions())
    .json({
      message: "Access token refreshed",
    });
});

export const verifyEmailHandler = asyncHandler(async (req, res) => {
  const code = verificatioCodeSchema.parse(req.params.code);
  const verificationCode = await prisma.verificationCode.findUnique({
    where: {
      id: code,
      type: "EMAIL_VERIFICATION",
      expiresAt: { gt: new Date() },
    },
  });
  appAssert(verificationCode, NOT_FOUND, "Invalid or expired code");

  const user = await prisma.user.update({
    where: { id: verificationCode.userId },
    data: { isVerified: true },
  });
  appAssert(user, INTERNAL_SERVER_ERROR, "User verification failed");

  await prisma.verificationCode.delete({ where: { id: verificationCode.id } });

  return res.status(OK).json({ message: "Email verified" });
});

export const sendPasswordResetEmailHandler = asyncHandler(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  const user = await prisma.user.findUnique({ where: { email } });

  // Do not reveal if user exists or not
  if (!user) {
    // Always return a generic success message
    return res
      .status(OK)
      .json({ message: "If an account exists, a reset email has been sent" });
  }

  // Handle rate limiting (per user)
  const fiveMinAgo = fiveMinutesAgo();
  const count = await prisma.verificationCode.count({
    where: { userId: user.id, createdAt: { gt: fiveMinAgo } },
  });

  if (count > 1) {
    return res
      .status(TOO_MANY_REQUESTS)
      .json({ message: "Please wait before requesting another reset email" });
  }

  // Create verification code
  const expiresAt = tenMinutesFromNow();
  const verificationCode = await prisma.verificationCode.create({
    data: { expiresAt, type: "PASSWORD_RESET", userId: user.id },
  });

  // Send verification email
  const url = `${APP_ORIGIN}/auth/reset-password?code=${
    verificationCode.id
  }&exp=${expiresAt.getTime()}`;
  try {
    await sendMail({
      to: user.email,
      ...getPasswordResetTemplate(url),
    });
  } catch (err) {
    console.error("Email send error:", err); // log internally
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong, please try again later" });
  }

  return res
    .status(OK)
    .json({ message: "If an account exists, a reset email has been sent" });
});

export const resetPasswordHandler = asyncHandler(async (req, res) => {
  const { password, verificationCode: code } = passwordResetSchema.parse({
    ...req.body,
  });

  // Verify code
  const verificationCode = await prisma.verificationCode.findUnique({
    where: { id: code, type: "PASSWORD_RESET", expiresAt: { gt: new Date() } },
  });
  appAssert(
    verificationCode,
    NOT_FOUND,
    "Invalid or Expired verification code"
  );

  // Update user password
  const user = await prisma.user.update({
    where: { id: verificationCode.userId },
    data: {
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  appAssert(user, INTERNAL_SERVER_ERROR, "Failed to reset password");

  // Delete code and sessions
  await prisma.verificationCode.delete({ where: { id: verificationCode.id } });
  await prisma.session.deleteMany({ where: { userId: user.id } });

  return res.status(OK).json({ message: "Password reset successful" });
});
