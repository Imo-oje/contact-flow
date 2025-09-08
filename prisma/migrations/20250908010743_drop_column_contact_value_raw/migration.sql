/*
  Warnings:

  - You are about to drop the column `contactValueRaw` on the `Contact` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Contact_contactValueRaw_key";

-- AlterTable
ALTER TABLE "public"."Contact" DROP COLUMN "contactValueRaw";
