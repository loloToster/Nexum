/*
  Warnings:

  - Added the required column `custom_id` to the `Widget` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Widget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "custom_id" TEXT NOT NULL,
    "tab_id" INTEGER NOT NULL,
    "device_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    CONSTRAINT "Widget_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "Tab" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Widget_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Widget" ("device_id", "height", "id", "tab_id", "type", "width", "x", "y") SELECT "device_id", "height", "id", "tab_id", "type", "width", "x", "y" FROM "Widget";
DROP TABLE "Widget";
ALTER TABLE "new_Widget" RENAME TO "Widget";
CREATE UNIQUE INDEX "Widget_x_y_tab_id_key" ON "Widget"("x", "y", "tab_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
