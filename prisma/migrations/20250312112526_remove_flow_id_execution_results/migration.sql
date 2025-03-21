/*
  Warnings:

  - You are about to drop the column `flowId` on the `ExecutionResult` table. All the data in the column will be lost.
  - Added the required column `iri` to the `ExecutionResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExecutionResult" DROP CONSTRAINT "ExecutionResult_flowId_fkey";

-- AlterTable
ALTER TABLE "ExecutionResult" DROP COLUMN "flowId",
ADD COLUMN     "iri" TEXT NOT NULL;
