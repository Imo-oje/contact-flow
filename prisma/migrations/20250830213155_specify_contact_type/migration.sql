/*
  Warnings:

  - Changed the type of `type` on the `Contact` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('BUSINESS', 'PERSONAL');

-- AlterTable
ALTER TABLE "public"."Contact" DROP COLUMN "type",
ADD COLUMN     "type" "public"."ContactType" NOT NULL;
