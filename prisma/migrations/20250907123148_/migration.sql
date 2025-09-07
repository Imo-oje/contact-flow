/*
  Warnings:

  - A unique constraint covering the columns `[contactValueRaw]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactValueNorm]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contact_contactValueRaw_key" ON "public"."Contact"("contactValueRaw");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_contactValueNorm_key" ON "public"."Contact"("contactValueNorm");
