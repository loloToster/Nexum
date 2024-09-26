/*
  Warnings:

  - Added the required column `name` to the `ggl_smarthome_trait_target` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ggl_smarthome_trait_target" ADD COLUMN     "name" TEXT NOT NULL;
