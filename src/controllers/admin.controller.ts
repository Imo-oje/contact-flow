import prisma from "../prisma/client";
import appAssert from "../utils/app-assert";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constants/http";
import { asyncHandler } from "../utils/async-handler";
import {
  getTodaysDate,
  twentyFourHoursAgo,
  fiveMinutesAgo,
} from "../utils/date";
import { NODE_ENV } from "../constants/env";
import { stringSchema } from "../utils/schema";

export const compileContacts = asyncHandler(async (req, res) => {
  const unCompiledContacts = await prisma.contact.findMany({
    where: { compilationId: null, compiledTo: null, deletedAt: null },
  });

  let compilation = await prisma.compilation.findFirst({
    where: {
      name: getTodaysDate(),
      createdAt: {
        gte:
          NODE_ENV === "development" ? fiveMinutesAgo() : twentyFourHoursAgo(), // within last 5mins || 24hrs
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
    where: { id: { in: unCompiledContacts.map((c) => c.id) }, deletedAt: null },
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

  res.json({
    count: `${unCompiledContacts.length} new contacts added. Total compiled: ${updatedCompilation.contacts.length}`,
  });
});

export const banContacts = asyncHandler(async (req, res) => {
  const phone = stringSchema.parse(req.body.contact);

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  appAssert(user, NOT_FOUND, "User not found");

  const contact = await prisma.contact.findUnique({
    where: { contactValueNorm: phone, isBanAt: null },
  });
  appAssert(contact, NOT_FOUND, "Contact not found or already banned");

  await prisma.contact.update({
    where: { id: contact.id },
    data: { isBanAt: new Date() },
  });

  res.json({ message: "Ban successful" });
});
