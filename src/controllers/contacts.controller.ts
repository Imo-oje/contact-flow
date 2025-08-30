import prisma from "../prisma/client";
import { normalizeContact, serializeContact } from "../utils/sanitize";
import { asyncHandler } from "../utils/async-handler";
import { createContactSchema, updateContactSchema } from "../utils/schema";
import appAssert from "../utils/app-assert";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constants/http";

// Create a new contact
export const addContact = asyncHandler(async (req, res) => {
  const {
    fullName: name,
    phoneNumber,
    type,
  } = createContactSchema().parse(req.body);
  const userId = req.userId;

  const contact = await prisma.contact.create({
    data: {
      ownerId: userId,
      name,
      contactValueRaw: phoneNumber,
      contactValueNorm: normalizeContact(phoneNumber),
      type,
    },
  });
  appAssert(
    contact,
    INTERNAL_SERVER_ERROR,
    "Contact creation failed, please try again."
  );

  res.status(201).json(contact);
});

// List user's own contacts
export const getMyContacts = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const contacts = await prisma.contact.findMany({
    where: { ownerId: userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  res.json(contacts);
});

// Update contact
export const updateContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const { fullName, phoneNumber, type } = updateContactSchema().parse(req.body);
  const userId = req.userId;

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, ownerId: userId, deletedAt: null },
  });
  appAssert(contact, NOT_FOUND, "Contact not found");

  const updated = await prisma.contact.update({
    where: { id: contactId, ownerId: userId, deletedAt: null },
    data: {
      name: fullName ?? contact.name,
      contactValueRaw: phoneNumber ?? contact.contactValueRaw,
      contactValueNorm: phoneNumber
        ? normalizeContact(phoneNumber)
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

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, ownerId: userId, deletedAt: null },
  });
  appAssert(contact, NOT_FOUND, "Contact not found");

  await prisma.contact.update({
    where: { id: contactId },
    data: { deletedAt: new Date() },
  });

  res.json({ message: "Contact deleted" });
});

// Restore deleted contacts
export const restoreContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const userId = req.userId;

  const restored = await prisma.contact.updateMany({
    where: { id: contactId, ownerId: userId, deletedAt: { not: null } },
    data: { deletedAt: null },
  });

  appAssert(
    restored.count > 0,
    NOT_FOUND,
    "Contact not found or already active"
  );
  res.json({ message: "Contact restored" });
});
