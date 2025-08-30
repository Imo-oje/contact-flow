import { Contact } from "../../generated/prisma";
import { SerializedContact } from "../types/contact";

export function normalizeContact(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@]/gi, "");
}

export function serializeContact(contact: Contact): SerializedContact {
  const { id, name, contactValueRaw, type, createdAt, updatedAt } = contact;
  return { id, name, phoneNumber: contactValueRaw, type, createdAt, updatedAt };
}
