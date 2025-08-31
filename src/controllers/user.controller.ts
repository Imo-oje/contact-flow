import { NOT_FOUND, OK } from "../constants/http";
import prisma from "../prisma/client";
import appAssert from "../utils/app-assert";
import { asyncHandler } from "../utils/async-handler";
import { serializeUser } from "../utils/sanitize";

export const getUser = asyncHandler(async (req, res) => {
  const userId = req.userId;

  // Fetch user with count of contacts
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { contacts: true } } },
  });
  appAssert(user, NOT_FOUND, "User not found");

  // Calculate network growth (contacts created in the last 7 days)

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const newConnectionsThisWeek = await prisma.contact.count({
    where: {
      ownerId: userId,
      createdAt: { gte: weekAgo },
      deletedAt: null,
    },
  });

  res.status(OK).json({
    ...serializeUser(user),
    contactsCount: user._count.contacts,
    networkGrowth: `+${newConnectionsThisWeek}`,
  });
});
