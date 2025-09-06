import { asyncHandler } from "../utils/async-handler";
import prisma from "../prisma/client";
import { serializeContactsToJson } from "../utils/sanitize";
import appAssert from "../utils/app-assert";
import { NOT_FOUND } from "../constants/http";

export const csvDownload = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  appAssert(user, NOT_FOUND, "User not found");

  const contacts = await prisma.contact.findMany({
    where: { owner: { id: { not: user.id } } },
    select: {
      contactValueNorm: true,
      name: true,
    },
  });
  console.log(serializeContactsToJson(contacts));

  res.json(serializeContactsToJson(contacts));
});
