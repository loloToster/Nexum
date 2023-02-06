/*
  Warnings:

  - You are about to drop the `device` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "widgets" DROP CONSTRAINT "widgets_device_id_fkey";

-- DropTable
DROP TABLE "device";

-- CreateTable
CREATE TABLE "devices" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_token_key" ON "devices"("token");

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
