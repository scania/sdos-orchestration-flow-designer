-- DropForeignKey
ALTER TABLE "Parameter" DROP CONSTRAINT "Parameter_id_fkey";

-- AddForeignKey
ALTER TABLE "Parameter" ADD CONSTRAINT "Parameter_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
