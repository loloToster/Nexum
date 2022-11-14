-- CreateTable
CREATE TABLE "WidgetProperties" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "widget_id" INTEGER NOT NULL,
    "color" TEXT,
    "text" TEXT,
    "isSwitch" BOOLEAN,
    "isVertical" BOOLEAN,
    "step" INTEGER,
    "min" INTEGER,
    "max" INTEGER,
    CONSTRAINT "WidgetProperties_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "Widget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WidgetProperties_widget_id_key" ON "WidgetProperties"("widget_id");
