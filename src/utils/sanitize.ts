import type { Compilation, Contact, User } from "@prisma/client";
import { SerializedContact, SerializedUser } from "../types";

interface SerializeCsv extends Compilation {
  contacts: Contact[];
}

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

export const serializeContactsToJson = (contacts: Contact[]) => {
  return contacts.map((contact) => ({
    name: contact.name,
    phone: contact.contactValueNorm,
  }));
};

export const serializeCsv = (csv: SerializeCsv[]) => {
  return csv.map((i) => ({
    id: i.id,
    name: i.name,
    createdAt: i.createdAt,
    count: i.contacts.length,
  }));
};
