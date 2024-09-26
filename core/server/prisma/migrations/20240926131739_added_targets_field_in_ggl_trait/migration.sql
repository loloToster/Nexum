/*
  Warnings:

  - Added the required column `traitId` to the `ggl_smarthome_trait_target` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ggl_smarthome_trait_target" ADD COLUMN     "traitId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ggl_smarthome_trait_target" ADD CONSTRAINT "ggl_smarthome_trait_target_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "ggl_smarthome_device_trait"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
