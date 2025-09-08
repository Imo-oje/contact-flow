import { asyncHandler } from "../utils/async-handler";
import prisma from "../prisma/client";
import { serializeContactsToJson, serializeCsv } from "../utils/sanitize";
import appAssert from "../utils/app-assert";
import { NOT_FOUND } from "../constants/http";
import { convertToCsv } from "../utils/csv";
import { twentyFourHoursAgo, fiveMinutesAgo } from "../utils/date";
import { NODE_ENV } from "../constants/env";

export const getCsv = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  appAssert(user, NOT_FOUND, "User not found");

  const csvFiles = await prisma.compilation.findMany({
    where: {
      createdAt: {
        gt: user.createdAt,
        lte:
          NODE_ENV === "development" ? fiveMinutesAgo() : twentyFourHoursAgo(), // older than 5min || 24hrs
      },
    },
    include: { contacts: true },
  });

  res.json(serializeCsv(csvFiles) || []);
});

export const csvDownload = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const compiled = await prisma.compilation.findUnique({
    where: { id: fileId },
    include: { contacts: true },
  });
  appAssert(compiled, NOT_FOUND, "Compilation not found");

  const contacts = serializeContactsToJson(
    compiled.contacts.map((contact) => ({ ...contact }))
  );

  const csv = await convertToCsv(contacts);
  res.json(csv);
});
