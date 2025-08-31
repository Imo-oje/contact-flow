import { Contact, User } from "../../generated/prisma";
import { SerializedContact, SerializedUser } from "../types";

export function normalizeContact(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@]/gi, "");
}

export function serializeContact(contact: Contact): SerializedContact {
  const { id, name, contactValueNorm, type, createdAt, updatedAt } = contact;
  return {
    id,
    name,
    phone: contactValueNorm,
    type,
    createdAt: createdAt.toISOString(),
  };
}

export function serializeUser(user: User): SerializedUser {
  const { id, name, email, allowSharing } = user;
  return { id, name, email, allowSharing };
}
