/*
  Warnings:

  - You are about to drop the column `data` on the `Parameter` table. All the data in the column will be lost.
  - Added the required column `value` to the `Parameter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parameter" DROP COLUMN "data",
ADD COLUMN     "value" JSONB NOT NULL;
