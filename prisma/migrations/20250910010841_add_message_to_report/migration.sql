/*
  Warnings:

  - Added the required column `message` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "message" TEXT NOT NULL;
