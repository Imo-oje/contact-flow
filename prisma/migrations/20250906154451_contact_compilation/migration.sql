-- AlterTable
ALTER TABLE "public"."Contact" ADD COLUMN     "compilationId" TEXT;

-- CreateTable
CREATE TABLE "public"."Compilation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "downloads" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compilation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_compilationId_fkey" FOREIGN KEY ("compilationId") REFERENCES "public"."Compilation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
