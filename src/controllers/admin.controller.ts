import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constants/http";
import prisma from "../prisma/client";
import appAssert from "../utils/app-assert";
import { asyncHandler } from "../utils/async-handler";
import { getTodaysDate } from "../utils/date";
import { serializeContactsToJson } from "../utils/sanitize";

export const compileContacts = asyncHandler(async (req, res, next) => {
  const unCompiledContacts = await prisma.contact.findMany({
    where: { compilationId: null, compiledTo: null },
  });

  let compilation = await prisma.compilation.findFirst({
    where: {
      name: getTodaysDate(),
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // within last 24hrs
        lte: new Date(),
      },
    },
    orderBy: { createdAt: "desc" },
    include: { contacts: true },
  });

  if (!compilation) {
    compilation = await prisma.compilation.create({
      data: { name: getTodaysDate() },
      include: { contacts: true },
    });
  }
  appAssert(compilation, NOT_FOUND, "Error finding or creating compilation");

  // Link contacts by updating their compilationId
  await prisma.contact.updateMany({
    where: { id: { in: unCompiledContacts.map((c) => c.id) } },
    data: { compilationId: compilation.id },
  });

  // Re-fetch compilation with fresh contacts
  const updatedCompilation = await prisma.compilation.findUnique({
    where: { id: compilation.id },
    include: { contacts: true },
  });

  appAssert(
    updatedCompilation,
    INTERNAL_SERVER_ERROR,
    "Could not get compilation after update"
  );

  res.json(serializeContactsToJson(updatedCompilation.contacts));
});
