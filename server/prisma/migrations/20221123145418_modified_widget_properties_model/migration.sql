/*
  Warnings:

  - You are about to alter the column `max` on the `WidgetProperties` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `min` on the `WidgetProperties` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `step` on the `WidgetProperties` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WidgetProperties" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "widget_id" INTEGER NOT NULL,
    "color" TEXT,
    "text" TEXT,
    "isSwitch" BOOLEAN,
    "isVertical" BOOLEAN,
    "step" REAL,
    "min" REAL,
    "max" REAL,
    CONSTRAINT "WidgetProperties_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "Widget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WidgetProperties" ("color", "id", "isSwitch", "isVertical", "max", "min", "step", "text", "widget_id") SELECT "color", "id", "isSwitch", "isVertical", "max", "min", "step", "text", "widget_id" FROM "WidgetProperties";
DROP TABLE "WidgetProperties";
ALTER TABLE "new_WidgetProperties" RENAME TO "WidgetProperties";
CREATE UNIQUE INDEX "WidgetProperties_widget_id_key" ON "WidgetProperties"("widget_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
