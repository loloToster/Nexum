/*
  Warnings:

  - You are about to drop the `Device` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tab` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Value` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Widget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WidgetProperties` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Widget" DROP CONSTRAINT "Widget_device_id_fkey";

-- DropForeignKey
ALTER TABLE "Widget" DROP CONSTRAINT "Widget_tab_id_fkey";

-- DropForeignKey
ALTER TABLE "WidgetProperties" DROP CONSTRAINT "WidgetProperties_widget_id_fkey";

-- DropForeignKey
ALTER TABLE "_TabToUser" DROP CONSTRAINT "_TabToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_TabToUser" DROP CONSTRAINT "_TabToUser_B_fkey";

-- DropTable
DROP TABLE "Device";

-- DropTable
DROP TABLE "Tab";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Value";

-- DropTable
DROP TABLE "Widget";

-- DropTable
DROP TABLE "WidgetProperties";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tabs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tabs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widgets" (
    "id" SERIAL NOT NULL,
    "custom_id" TEXT NOT NULL,
    "tab_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widget_properties" (
    "id" SERIAL NOT NULL,
    "widget_id" INTEGER NOT NULL,
    "title" TEXT,
    "color" TEXT,
    "text" TEXT,
    "on_text" TEXT,
    "off_text" TEXT,
    "is_switch" BOOLEAN,
    "is_vertical" BOOLEAN,
    "step" DOUBLE PRECISION,
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,

    CONSTRAINT "widget_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "values" (
    "device_id" INTEGER NOT NULL,
    "custom_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "values_pkey" PRIMARY KEY ("device_id","custom_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "widgets_x_y_tab_id_key" ON "widgets"("x", "y", "tab_id");

-- CreateIndex
CREATE UNIQUE INDEX "widget_properties_widget_id_key" ON "widget_properties"("widget_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_token_key" ON "device"("token");

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "tabs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_properties" ADD CONSTRAINT "widget_properties_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TabToUser" ADD CONSTRAINT "_TabToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "tabs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TabToUser" ADD CONSTRAINT "_TabToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
