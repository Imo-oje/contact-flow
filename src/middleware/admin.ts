import prisma from "../prisma/client";
import { asyncHandler } from "../utils/async-handler";

export const admin = asyncHandler(async (req, _res, next) => {
  // verify that user is an admin
  //const conpilationKey =
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  next();
});
