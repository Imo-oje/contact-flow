/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,contactValueNorm,deletedAt]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contact_ownerId_contactValueNorm_deletedAt_key" ON "public"."Contact"("ownerId", "contactValueNorm", "deletedAt");
