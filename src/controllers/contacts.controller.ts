import prisma from "../prisma/client";
import {
  normalizeContact,
  serializeContact,
  serializeContactsToJson,
} from "../utils/sanitize";
import { asyncHandler } from "../utils/async-handler";
import { createContactSchema, updateContactSchema } from "../utils/schema";
import appAssert from "../utils/app-assert";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constants/http";

// Create a new contact
export const addContact = asyncHandler(async (req, res) => {
  const { name, phone, type } = createContactSchema().parse(req.body);
  const userId = req.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  appAssert(user, NOT_FOUND, "User not found");

  const contact = await prisma.contact.create({
    data: {
      ownerId: user.id,
      name,
      contactValueNorm: normalizeContact(phone),
      type,
    },
  });
  appAssert(
    contact,
    INTERNAL_SERVER_ERROR,
    "Contact creation failed, please try again."
  );

  res.status(201).json(serializeContact(contact));
});

// List user's own contacts
export const getMyContacts = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  appAssert(user, NOT_FOUND, "User not found");

  const contacts = await prisma.contact.findMany({
    where: { ownerId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  const result = contacts.map((contact) => serializeContact(contact));
  res.json(result);
});

// Update contact
export const updateContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const { name, phone, type } = updateContactSchema().parse(req.body);
  const userId = req.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  appAssert(user, NOT_FOUND, "User not found");

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, ownerId: user.id, deletedAt: null },
  });
  appAssert(contact, NOT_FOUND, "Contact not found");

  const updated = await prisma.contact.update({
    where: { id: contact.id, ownerId: user.id, deletedAt: null },
    data: {
      name: name ?? contact.name,
      contactValueNorm: phone
        ? normalizeContact(phone)
        : contact.contactValueNorm,
      type: type ?? contact.type,
    },
  });

  appAssert(updated, NOT_FOUND, "Contact not found or deleted");

  res.json(serializeContact(updated));
});

// Soft delete contact
export const deleteContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const userId = req.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  appAssert(user, NOT_FOUND, "User not found");

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, ownerId: user.id, deletedAt: null },
  });
  appAssert(contact, NOT_FOUND, "Contact not found");

  await prisma.contact.update({
    where: { id: contactId, ownerId: user.id },
    data: { deletedAt: new Date() },
  });

  res.json({ message: "Contact deleted" });
});

// Restore deleted contacts
export const restoreContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const userId = req.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  appAssert(user, NOT_FOUND, "User not found");

  const restored = await prisma.contact.updateMany({
    where: { id: contactId, ownerId: user.id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });

  appAssert(
    restored.count > 0,
    NOT_FOUND,
    "Contact not found or already active"
  );
  res.json({ message: "Contact restored" });
});

export const exportPersonalContacts = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  appAssert(user, NOT_FOUND, "User not found");

  const contacts = await prisma.contact.findMany({
    where: { owner: { id: user.id }, ownerId: user.id },
  });

  res.json({ message: "Export started. You'll get a link when ready." });
});
