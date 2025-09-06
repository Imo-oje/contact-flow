import prisma from "../prisma/client";
import { asyncHandler } from "../utils/async-handler";

export const compileContacts = asyncHandler(async (req, res, next) => {
  // verify access

  const privateKey = req.params["privateKey"];
  //const ValidatePrivateKey =
  const admin = prisma.user.findUnique({ where: { id: req.userId } });
});
