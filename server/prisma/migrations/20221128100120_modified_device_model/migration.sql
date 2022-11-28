/*
  Warnings:

  - You are about to alter the column `device_id` on the `Widget` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Device` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Device` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The required column `token` was added to the `Device` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Widget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "custom_id" TEXT NOT NULL,
    "tab_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    CONSTRAINT "Widget_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "Tab" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Widget_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Widget" ("custom_id", "device_id", "height", "id", "tab_id", "type", "width", "x", "y") SELECT "custom_id", "device_id", "height", "id", "tab_id", "type", "width", "x", "y" FROM "Widget";
DROP TABLE "Widget";
ALTER TABLE "new_Widget" RENAME TO "Widget";
CREATE UNIQUE INDEX "Widget_x_y_tab_id_key" ON "Widget"("x", "y", "tab_id");
CREATE TABLE "new_Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Device" ("id", "name") SELECT "id", "name" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
CREATE UNIQUE INDEX "Device_token_key" ON "Device"("token");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
